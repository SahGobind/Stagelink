"""
StageLink Help & Support System — Django REST Framework Views.
MongoDB Atlas Integration with persistent support ticket workflows
for Candidates, Recruiters, and the Unified Operation Team.
"""

import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    SupportTicketCreateSerializer,
    SupportReplySerializer,
    SupportInternalNoteSerializer,
    SupportTicketUpdateSerializer,
    CANDIDATE_CATEGORIES,
    RECRUITER_CATEGORIES,
)
from . import repository
from starcast.db import check_db_connection
from starcast.utils import handle_db_error, clean_doc, get_auth_user_from_request

sanitize_ticket_for_user = repository.sanitize_ticket_for_user


class SupportTicketListCreateView(APIView):
    """
    GET: List tickets based on user role and permissions from MongoDB.
    POST: Create a support ticket and receive persistent reference number.
    """

    def get(self, request):
        auth_user = get_auth_user_from_request(request)
        role = request.query_params.get("role", "candidate").lower()
        user_id = request.query_params.get("user_id", "")

        # Enforce role isolation: non-staff cannot spoof another role or user_id
        if auth_user:
            auth_role = auth_user.get("role", "candidate")
            if auth_role not in ("admin", "operations", "super_admin"):
                role = auth_role
                user_id = auth_user.get("id")

        status_filter = request.query_params.get("status", "").lower()
        user_type_filter = request.query_params.get("user_type", "").lower()
        search = request.query_params.get("search", "").strip()
        category = request.query_params.get("category", "").strip()

        try:
            results = repository.list_tickets(
                role=role,
                user_id=user_id,
                status_filter=status_filter,
                user_type_filter=user_type_filter,
                search=search,
                category=category
            )
            sanitized = [sanitize_ticket_for_user(t, role) for t in results]

            return Response(
                {
                    "count": len(sanitized),
                    "storage_mode": "persistent_mongodb_atlas",
                    "results": sanitized,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as err:
            return handle_db_error(err)

    def post(self, request):
        serializer = SupportTicketCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Validation failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            data = serializer.validated_data
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            ticket_number = repository.get_next_ticket_number()

            initial_msg = {
                "id": f"msg-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)}",
                "sender_id": data.get("user_id", "usr-1"),
                "sender_name": data.get("user_name", "StageLink Member"),
                "sender_role": data.get("user_role", "candidate"),
                "content": data["message"],
                "timestamp": now_iso,
                "attachment": data.get("attachment"),
            }

            new_ticket = {
                "id": ticket_number,
                "ticket_number": ticket_number,
                "user_id": data.get("user_id", "usr-1"),
                "user_name": data.get("user_name", "StageLink Member"),
                "user_email": data.get("user_email", "user@stagelink.com"),
                "user_role": data.get("user_role", "candidate"),
                "company_name": data.get("company_name", ""),
                "category": data["category"],
                "subject": data["subject"],
                "priority": "normal",
                "status": "open",
                "assigned_to": "Unassigned",
                "assigned_staff_id": "",
                "created_at": now_iso,
                "last_reply_at": now_iso,
                "last_reply_by": data.get("user_name", "StageLink Member"),
                "last_reply_role": data.get("user_role", "candidate"),
                "unread_for_user": False,
                "unread_for_staff": True,
                "messages": [initial_msg],
                "notes": [],
                "history": [
                    {
                        "event": "Ticket created",
                        "timestamp": now_iso,
                        "actor": data.get("user_name", "StageLink Member"),
                    }
                ],
            }

            created = repository.create_ticket(new_ticket)
            return Response(
                {
                    "message": "Support ticket created successfully.",
                    "ticket_number": ticket_number,
                    "ticket": sanitize_ticket_for_user(created, data.get("user_role", "candidate")),
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as err:
            return handle_db_error(err)



class SupportTicketDetailView(APIView):
    """
    GET: Retrieve ticket conversation.
    PATCH/PUT: Update ticket status, priority, or assignment (Operation Staff only).
    """

    def get(self, request, ticket_id):
        role = request.query_params.get("role", "candidate").lower()
        user_id = request.query_params.get("user_id", "")

        try:
            ticket = repository.find_ticket_by_id(ticket_id)
            if not ticket:
                return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            # Enforce role-based access
            if role not in ["operations", "admin"]:
                if user_id and ticket["user_id"] != user_id:
                    return Response(
                        {"error": "Forbidden: You do not have permission to view this ticket."},
                        status=status.HTTP_403_FORBIDDEN,
                    )
                repository.update_ticket(ticket["id"], {"unread_for_user": False})
                ticket["unread_for_user"] = False
            else:
                repository.update_ticket(ticket["id"], {"unread_for_staff": False})
                ticket["unread_for_staff"] = False

            return Response(sanitize_ticket_for_user(ticket, role), status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def patch(self, request, ticket_id):
        role = request.data.get("operator_role", "operations").lower()
        operator_name = request.data.get("operator_name", "Operation Staff")

        if role not in ["operations", "admin"]:
            return Response(
                {"error": "Forbidden: Only operation team staff can update ticket properties."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            ticket = repository.find_ticket_by_id(ticket_id)
            if not ticket:
                return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            serializer = SupportTicketUpdateSerializer(data=request.data, partial=True)
            if not serializer.is_valid():
                return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            data = serializer.validated_data
            updates = {}
            history_events = list(ticket.get("history", []))

            if "status" in data and data["status"] != ticket["status"]:
                old_s = ticket["status"]
                new_s = data["status"]
                updates["status"] = new_s
                history_events.append({
                    "event": f"Status changed from {old_s} to {new_s}",
                    "timestamp": now_iso,
                    "actor": operator_name,
                })
                if new_s in ["resolved", "closed"]:
                    updates["unread_for_user"] = True

            if "priority" in data and data["priority"] != ticket["priority"]:
                updates["priority"] = data["priority"]
                history_events.append({
                    "event": f"Priority set to {data['priority'].capitalize()}",
                    "timestamp": now_iso,
                    "actor": operator_name,
                })

            if "assigned_to" in data:
                updates["assigned_to"] = data["assigned_to"]
                if "assigned_staff_id" in data:
                    updates["assigned_staff_id"] = data["assigned_staff_id"]
                history_events.append({
                    "event": f"Assigned to {data['assigned_to']}",
                    "timestamp": now_iso,
                    "actor": operator_name,
                })

            updates["history"] = history_events
            updated = repository.update_ticket(ticket["id"], updates)

            return Response(
                {
                    "message": "Ticket updated successfully.",
                    "ticket": sanitize_ticket_for_user(updated, role),
                },
                status=status.HTTP_200_OK,
            )
        except Exception as err:
            return handle_db_error(err)


class SupportTicketReplyView(APIView):
    """
    POST: Send a reply to the ticket conversation.
    """

    def post(self, request, ticket_id):
        try:
            ticket = repository.find_ticket_by_id(ticket_id)
            if not ticket:
                return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            serializer = SupportReplySerializer(data=request.data)
            if not serializer.is_valid():
                return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

            data = serializer.validated_data
            sender_role = data.get("sender_role", "candidate")
            sender_id = data.get("sender_id", "")
            sender_name = data.get("sender_name", "User")

            # Cross-account protection
            if sender_role not in ["operations", "admin"]:
                if sender_id and ticket["user_id"] != sender_id:
                    return Response(
                        {"error": "Forbidden: You cannot reply to another user's ticket."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            new_msg = {
                "id": f"msg-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)}",
                "sender_id": sender_id or ("staff-id" if sender_role in ["operations", "admin"] else ticket["user_id"]),
                "sender_name": sender_name,
                "sender_role": sender_role,
                "content": data["content"],
                "timestamp": now_iso,
                "attachment": data.get("attachment"),
            }

            updates = {
                "last_reply_at": now_iso,
                "last_reply_by": sender_name,
                "last_reply_role": sender_role,
            }

            history_event = None
            if sender_role in ["operations", "admin"]:
                updates["unread_for_user"] = True
                updates["unread_for_staff"] = False
                if ticket["status"] == "open":
                    updates["status"] = "in_progress"
            else:
                updates["unread_for_staff"] = True
                updates["unread_for_user"] = False
                if ticket["status"] in ["waiting_user", "resolved"]:
                    updates["status"] = "in_progress"
                    history_event = {
                        "event": "Ticket reopened by user reply",
                        "timestamp": now_iso,
                        "actor": sender_name,
                    }

            updated = repository.add_message_to_ticket(ticket["id"], new_msg, updates, history_event)

            return Response(
                {
                    "message": "Reply sent successfully.",
                    "reply": new_msg,
                    "ticket": sanitize_ticket_for_user(updated, sender_role),
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as err:
            return handle_db_error(err)


class SupportTicketInternalNoteView(APIView):
    """
    POST: Add private internal staff note (Operation Staff only).
    """

    def post(self, request, ticket_id):
        role = request.data.get("operator_role", "operations").lower()
        if role not in ["operations", "admin"]:
            return Response(
                {"error": "Forbidden: Internal notes can only be viewed and added by Operation Team staff."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            ticket = repository.find_ticket_by_id(ticket_id)
            if not ticket:
                return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            serializer = SupportInternalNoteSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

            data = serializer.validated_data
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            note_entry = {
                "id": f"note-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)}",
                "author_id": data.get("author_id", "admin-1"),
                "author_name": data.get("author_name", "Operation Staff"),
                "note": data["note"],
                "timestamp": now_iso,
            }

            history_event = {
                "event": "Private internal note added",
                "timestamp": now_iso,
                "actor": data.get("author_name", "Operation Staff"),
            }

            updated = repository.add_note_to_ticket(ticket["id"], note_entry, history_event)

            return Response(
                {
                    "message": "Internal note saved.",
                    "note": note_entry,
                    "ticket": sanitize_ticket_for_user(updated, role),
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as err:
            return handle_db_error(err)


class SupportTicketReopenView(APIView):
    """
    POST: Reopen a resolved ticket if issue is still unresolved.
    """

    def post(self, request, ticket_id):
        try:
            ticket = repository.find_ticket_by_id(ticket_id)
            if not ticket:
                return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            user_id = request.data.get("user_id", "")
            role = request.data.get("role", "candidate")
            actor_name = request.data.get("actor_name", "User")

            if role not in ["operations", "admin"] and user_id and ticket["user_id"] != user_id:
                return Response(
                    {"error": "Forbidden: You cannot reopen another user's ticket."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            history = list(ticket.get("history", []))
            history.append({
                "event": f"Ticket reopened by {actor_name}",
                "timestamp": now_iso,
                "actor": actor_name,
            })

            updated = repository.update_ticket(ticket["id"], {
                "status": "in_progress",
                "unread_for_staff": True,
                "history": history
            })

            return Response(
                {
                    "message": "Ticket reopened successfully.",
                    "ticket": sanitize_ticket_for_user(updated, role),
                },
                status=status.HTTP_200_OK,
            )
        except Exception as err:
            return handle_db_error(err)


class SupportMetricsView(APIView):
    """
    GET: Operation Team dashboard summary metrics from MongoDB.
    """

    def get(self, request):
        role = request.query_params.get("role", "operations")
        if role not in ["operations", "admin"]:
            return Response(
                {"error": "Forbidden: Metrics are only accessible to authorized Operation Staff."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            metrics = repository.get_metrics_counts()
            metrics["categories"] = {
                "candidate": CANDIDATE_CATEGORIES,
                "recruiter": RECRUITER_CATEGORIES,
            }
            return Response(metrics, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class SupportHealthView(APIView):
    """
    GET: Health check and metadata for Help & Support system.
    """

    def get(self, request):
        db_check = check_db_connection()
        return Response(
            {
                "status": "healthy",
                "service": "StageLink Support & Helpdesk Service",
                "database_mode": "mongodb_atlas",
                "database_connected": db_check.get("connected", False),
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            },
            status=status.HTTP_200_OK,
        )

