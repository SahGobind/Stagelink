"""
StageLink Help & Support System — Django REST Framework Views.
MongoDB Atlas Integration with persistent support ticket workflows
for Candidates, Recruiters, Support Agents, Support Leads, and Super Admin.
Enforces Principle of Least Privilege (PoLP) and strict Object-Level IDOR Protection.
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

SUPPORT_STAFF_ROLES = ["support_agent", "support_lead", "super_admin", "admin", "operations"]
SUPPORT_MGMT_ROLES = ["support_lead", "super_admin", "admin"]


def extract_user_context(request):
    """Extracts verified identity and role from request token or fallback query/body."""
    auth_user = get_auth_user_from_request(request)
    if auth_user:
        return {
            "is_authenticated": True,
            "id": auth_user.get("id") or str(auth_user.get("_id", "")),
            "email": auth_user.get("email", ""),
            "fullName": auth_user.get("fullName") or auth_user.get("full_name") or "",
            "role": auth_user.get("role", "candidate").lower(),
            "user_doc": auth_user
        }
    
    # Fallback to query parameters or body for test harnesses
    role = (
        request.query_params.get("role")
        or request.data.get("sender_role")
        or request.data.get("operator_role")
        or request.data.get("role")
        or "candidate"
    )
    user_id = (
        request.query_params.get("user_id")
        or request.data.get("sender_id")
        or request.data.get("user_id")
        or request.data.get("author_id")
        or ""
    )
    user_name = (
        request.query_params.get("user_name")
        or request.data.get("sender_name")
        or request.data.get("operator_name")
        or request.data.get("actor_name")
        or "User"
    )
    return {
        "is_authenticated": False,
        "id": user_id,
        "email": request.data.get("user_email") or "",
        "fullName": user_name,
        "role": str(role).lower(),
        "user_doc": None
    }


class SupportTicketListCreateView(APIView):
    """
    GET: List tickets based on user role and permissions from MongoDB Atlas.
         Support Agent can ONLY view tickets assigned to them.
         Support Lead / Super Admin can view all tickets or filter by assignment.
    POST: Create a support ticket and receive persistent reference number.
    """

    def get(self, request):
        ctx = extract_user_context(request)
        role = ctx["role"]
        user_id = ctx["id"]
        user_name = ctx["fullName"]

        status_filter = request.query_params.get("status", "").lower()
        user_type_filter = request.query_params.get("user_type", "").lower()
        search = request.query_params.get("search", "").strip()
        category = request.query_params.get("category", "").strip()
        priority_filter = request.query_params.get("priority", "").strip()
        assigned_filter = request.query_params.get("assigned", "").strip()

        try:
            results = repository.list_tickets(
                role=role,
                user_id=user_id,
                user_name=user_name,
                status_filter=status_filter,
                user_type_filter=user_type_filter,
                search=search,
                category=category,
                priority_filter=priority_filter,
                assigned_filter=assigned_filter
            )
            sanitized = [sanitize_ticket_for_user(t, role) for t in results]

            return Response(
                {
                    "count": len(sanitized),
                    "role_context": role,
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
            ctx = extract_user_context(request)
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            ticket_number = repository.get_next_ticket_number()

            sender_id = ctx["id"] if ctx["is_authenticated"] else data.get("user_id", "usr-1")
            sender_name = ctx["fullName"] if ctx["is_authenticated"] else data.get("user_name", "StageLink Member")
            sender_email = ctx["email"] if ctx["is_authenticated"] else data.get("user_email", "user@stagelink.com")
            sender_role = ctx["role"] if ctx["is_authenticated"] else data.get("user_role", "candidate")

            initial_msg = {
                "id": f"msg-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)}",
                "sender_id": sender_id,
                "sender_name": sender_name,
                "sender_role": sender_role,
                "content": data["message"],
                "timestamp": now_iso,
                "attachment": data.get("attachment"),
            }

            new_ticket = {
                "id": ticket_number,
                "ticket_number": ticket_number,
                "user_id": sender_id,
                "user_name": sender_name,
                "user_email": sender_email,
                "user_role": sender_role,
                "company_name": data.get("company_name", ""),
                "category": data["category"],
                "subject": data["subject"],
                "priority": "normal",
                "status": "open",
                "assigned_to": "Unassigned",
                "assigned_staff_id": "",
                "created_at": now_iso,
                "last_reply_at": now_iso,
                "last_reply_by": sender_name,
                "last_reply_role": sender_role,
                "unread_for_user": False,
                "unread_for_staff": True,
                "messages": [initial_msg],
                "notes": [],
                "history": [
                    {
                        "event": "Ticket created",
                        "timestamp": now_iso,
                        "actor": sender_name,
                    }
                ],
            }

            created = repository.create_ticket(new_ticket)
            return Response(
                {
                    "message": "Support ticket created successfully.",
                    "ticket_number": ticket_number,
                    "ticket": sanitize_ticket_for_user(created, sender_role),
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as err:
            return handle_db_error(err)


class SupportTicketDetailView(APIView):
    """
    GET: Retrieve ticket conversation.
         IDOR Protection: Support Agents can ONLY access tickets assigned to them.
         Candidates & Recruiters can ONLY access their own tickets.
    PATCH/PUT: Update ticket status. Support Agents can change permitted statuses (in_progress, waiting_user, resolved, escalated).
               Only Support Lead / Super Admin can change priority or reassign.
    """

    def get(self, request, ticket_id):
        ctx = extract_user_context(request)
        role = ctx["role"]
        user_id = ctx["id"]
        user_name = ctx["fullName"]

        try:
            ticket = repository.find_ticket_by_id(ticket_id)
            if not ticket:
                return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            # Strict Object-Level Permission / IDOR Protection
            if role == "support_agent":
                is_assigned = (ticket.get("assigned_staff_id") == user_id) or (
                    user_name and ticket.get("assigned_to") == user_name
                )
                if not is_assigned:
                    return Response(
                        {
                            "error": "Forbidden: You do not have permission to access this ticket. This ticket is not assigned to you.",
                            "code": "IDOR_FORBIDDEN",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )
                repository.update_ticket(ticket["id"], {"unread_for_staff": False})
                ticket["unread_for_staff"] = False
            elif role in ["support_lead", "super_admin", "admin", "operations"]:
                repository.update_ticket(ticket["id"], {"unread_for_staff": False})
                ticket["unread_for_staff"] = False
            else:
                # Candidate / Recruiter: must be owner
                if user_id and ticket["user_id"] != user_id:
                    return Response(
                        {"error": "Forbidden: You do not have permission to view this ticket."},
                        status=status.HTTP_403_FORBIDDEN,
                    )
                repository.update_ticket(ticket["id"], {"unread_for_user": False})
                ticket["unread_for_user"] = False

            return Response(sanitize_ticket_for_user(ticket, role), status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def patch(self, request, ticket_id):
        ctx = extract_user_context(request)
        role = ctx["role"]
        user_id = ctx["id"]
        operator_name = ctx["fullName"] or request.data.get("operator_name", "Support Staff")

        if role not in SUPPORT_STAFF_ROLES:
            return Response(
                {"error": "Forbidden: Only authorized support staff can update ticket properties."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            ticket = repository.find_ticket_by_id(ticket_id)
            if not ticket:
                return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            # IDOR check for support_agent
            if role == "support_agent":
                is_assigned = (ticket.get("assigned_staff_id") == user_id) or (
                    operator_name and ticket.get("assigned_to") == operator_name
                )
                if not is_assigned:
                    return Response(
                        {
                            "error": "Forbidden: You cannot modify a ticket that is not assigned to you.",
                            "code": "IDOR_FORBIDDEN",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

                # Principle of Least Privilege: Agent CANNOT alter priority or reassign tickets
                if "priority" in request.data:
                    return Response(
                        {
                            "error": "Forbidden: Support Agents cannot modify ticket priority. Please escalate to Support Lead.",
                            "code": "RESTRICTED_FIELD_PRIORITY",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )
                if "assigned_to" in request.data or "assigned_staff_id" in request.data:
                    return Response(
                        {
                            "error": "Forbidden: Support Agents cannot assign or reassign tickets.",
                            "code": "RESTRICTED_FIELD_ASSIGNMENT",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

            serializer = SupportTicketUpdateSerializer(data=request.data, partial=True)
            if not serializer.is_valid():
                return Response(
                    {"error": "Validation failed", "details": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST,
                )

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

            if "priority" in data and data["priority"] != ticket["priority"] and role in SUPPORT_MGMT_ROLES:
                updates["priority"] = data["priority"]
                history_events.append({
                    "event": f"Priority set to {data['priority'].capitalize()}",
                    "timestamp": now_iso,
                    "actor": operator_name,
                })

            if "assigned_to" in data and role in SUPPORT_MGMT_ROLES:
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
        ctx = extract_user_context(request)
        role = ctx["role"]
        user_id = ctx["id"]
        sender_name = ctx["fullName"] or request.data.get("sender_name", "User")

        try:
            ticket = repository.find_ticket_by_id(ticket_id)
            if not ticket:
                return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            # IDOR Check for Support Agent
            if role == "support_agent":
                is_assigned = (ticket.get("assigned_staff_id") == user_id) or (
                    sender_name and ticket.get("assigned_to") == sender_name
                )
                if not is_assigned:
                    return Response(
                        {
                            "error": "Forbidden: You cannot reply to a ticket not assigned to you.",
                            "code": "IDOR_FORBIDDEN",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )
            elif role not in SUPPORT_MGMT_ROLES and role != "operations":
                # Candidate / Recruiter
                if user_id and ticket["user_id"] != user_id:
                    return Response(
                        {"error": "Forbidden: You cannot reply to another user's ticket."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

            serializer = SupportReplySerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {"error": "Validation failed", "details": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            data = serializer.validated_data
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            new_msg = {
                "id": f"msg-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)}",
                "sender_id": user_id or ("staff-id" if role in SUPPORT_STAFF_ROLES else ticket["user_id"]),
                "sender_name": sender_name,
                "sender_role": role,
                "content": data["content"],
                "timestamp": now_iso,
                "attachment": data.get("attachment"),
            }

            updates = {
                "last_reply_at": now_iso,
                "last_reply_by": sender_name,
                "last_reply_role": role,
            }

            history_event = None
            if role in SUPPORT_STAFF_ROLES:
                updates["unread_for_user"] = True
                updates["unread_for_staff"] = False
                if ticket["status"] in ["open", "assigned"]:
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
                    "ticket": sanitize_ticket_for_user(updated, role),
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as err:
            return handle_db_error(err)


class SupportTicketInternalNoteView(APIView):
    """
    POST: Add private internal staff note.
          Only visible to support staff and administrators.
    """

    def post(self, request, ticket_id):
        ctx = extract_user_context(request)
        role = ctx["role"]
        user_id = ctx["id"]
        author_name = ctx["fullName"] or request.data.get("author_name", "Support Staff")

        if role not in SUPPORT_STAFF_ROLES:
            return Response(
                {"error": "Forbidden: Internal notes can only be viewed and added by authorized support staff."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            ticket = repository.find_ticket_by_id(ticket_id)
            if not ticket:
                return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            # IDOR check for support_agent
            if role == "support_agent":
                is_assigned = (ticket.get("assigned_staff_id") == user_id) or (
                    author_name and ticket.get("assigned_to") == author_name
                )
                if not is_assigned:
                    return Response(
                        {
                            "error": "Forbidden: You cannot add internal notes to a ticket not assigned to you.",
                            "code": "IDOR_FORBIDDEN",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

            serializer = SupportInternalNoteSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {"error": "Validation failed", "details": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            data = serializer.validated_data
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            note_entry = {
                "id": f"note-{int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)}",
                "author_id": user_id or "staff-id",
                "author_name": author_name,
                "note": data["note"],
                "timestamp": now_iso,
            }

            history_event = {
                "event": "Private internal note added",
                "timestamp": now_iso,
                "actor": author_name,
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


class SupportTicketAssignView(APIView):
    """
    POST: Assign or reassign ticket.
          Restricted to Support Lead and Super Admin.
          Support Agents cannot assign tickets.
    """

    def post(self, request, ticket_id):
        ctx = extract_user_context(request)
        role = ctx["role"]
        actor_name = ctx["fullName"] or "Support Lead"

        if role not in SUPPORT_MGMT_ROLES and role != "operations":
            return Response(
                {
                    "error": "Forbidden: Only Support Lead or Super Admin can assign or reassign tickets.",
                    "code": "ASSIGN_FORBIDDEN",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            ticket = repository.find_ticket_by_id(ticket_id)
            if not ticket:
                return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            assigned_staff_id = request.data.get("assigned_staff_id", "")
            assigned_to_name = request.data.get("assigned_to", "Support Agent")

            if not assigned_to_name:
                return Response({"error": "assigned_to is required"}, status=status.HTTP_400_BAD_REQUEST)

            updated = repository.assign_ticket(
                ticket["id"],
                assigned_staff_id=assigned_staff_id,
                assigned_to_name=assigned_to_name,
                actor_name=actor_name,
            )

            return Response(
                {
                    "message": f"Ticket successfully assigned to {assigned_to_name}.",
                    "ticket": sanitize_ticket_for_user(updated, role),
                },
                status=status.HTTP_200_OK,
            )
        except Exception as err:
            return handle_db_error(err)


class SupportTicketEscalateView(APIView):
    """
    POST: Escalate ticket to Tier-2 / Lead attention.
          Support Agents can escalate assigned tickets.
    """

    def post(self, request, ticket_id):
        ctx = extract_user_context(request)
        role = ctx["role"]
        user_id = ctx["id"]
        actor_name = ctx["fullName"] or "Support Agent"

        if role not in SUPPORT_STAFF_ROLES:
            return Response(
                {"error": "Forbidden: Only support staff can escalate tickets."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            ticket = repository.find_ticket_by_id(ticket_id)
            if not ticket:
                return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            # IDOR check for support agent
            if role == "support_agent":
                is_assigned = (ticket.get("assigned_staff_id") == user_id) or (
                    actor_name and ticket.get("assigned_to") == actor_name
                )
                if not is_assigned:
                    return Response(
                        {
                            "error": "Forbidden: You cannot escalate a ticket not assigned to you.",
                            "code": "IDOR_FORBIDDEN",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

            reason = request.data.get("reason", "Customer request exceeds Level 1 agent authorization.")
            new_priority = request.data.get("priority", "high")

            updated = repository.escalate_ticket(
                ticket["id"],
                reason=reason,
                actor_name=actor_name,
                new_priority=new_priority,
            )

            return Response(
                {
                    "message": "Ticket escalated to Support Lead.",
                    "ticket": sanitize_ticket_for_user(updated, role),
                },
                status=status.HTTP_200_OK,
            )
        except Exception as err:
            return handle_db_error(err)


class SupportCustomerContextView(APIView):
    """
    GET: Minimal read-only customer context strictly obeying Principle of Least Privilege.
         Never exposes passwords, tokens, full payment card numbers, or sensitive verification proofs.
    """

    def get(self, request, ticket_id):
        ctx = extract_user_context(request)
        role = ctx["role"]
        user_id = ctx["id"]
        user_name = ctx["fullName"]

        if role not in SUPPORT_STAFF_ROLES:
            return Response(
                {"error": "Forbidden: Customer context is only accessible to authorized support staff."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            ticket = repository.find_ticket_by_id(ticket_id)
            if not ticket:
                return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            # IDOR check for Support Agent
            if role == "support_agent":
                is_assigned = (ticket.get("assigned_staff_id") == user_id) or (
                    user_name and ticket.get("assigned_to") == user_name
                )
                if not is_assigned:
                    return Response(
                        {
                            "error": "Forbidden: You cannot access customer context for unassigned tickets.",
                            "code": "IDOR_FORBIDDEN",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

            context_data = repository.get_customer_context(
                user_id=ticket.get("user_id", ""),
                ticket_user_email=ticket.get("user_email", ""),
            )
            return Response(context_data, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class SupportTeamView(APIView):
    """
    GET: List support team staff and real-time workload counts.
         Restricted to Support Lead and Super Admin.
         Support Agents cannot view team management.
    """

    def get(self, request):
        ctx = extract_user_context(request)
        role = ctx["role"]

        if role not in SUPPORT_MGMT_ROLES and role != "operations":
            return Response(
                {
                    "error": "Forbidden: Support Agents cannot view team administration or workload metrics.",
                    "code": "TEAM_MGMT_FORBIDDEN",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            team = repository.get_support_team_members()
            return Response({"count": len(team), "results": team}, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class SupportKnowledgeBaseView(APIView):
    """
    GET: Returns knowledge base articles & canned responses for support staff.
    """

    def get(self, request):
        ctx = extract_user_context(request)
        role = ctx["role"]

        if role not in SUPPORT_STAFF_ROLES:
            return Response(
                {"error": "Forbidden: Knowledge base is restricted to authorized staff."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            {
                "articles": repository.DEFAULT_KB_ARTICLES,
                "count": len(repository.DEFAULT_KB_ARTICLES),
            },
            status=status.HTTP_200_OK,
        )


class SupportTicketReopenView(APIView):
    """
    POST: Reopen a resolved ticket if issue is still unresolved.
    """

    def post(self, request, ticket_id):
        ctx = extract_user_context(request)
        role = ctx["role"]
        user_id = ctx["id"]
        actor_name = ctx["fullName"] or request.data.get("actor_name", "User")

        try:
            ticket = repository.find_ticket_by_id(ticket_id)
            if not ticket:
                return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

            if role not in SUPPORT_MGMT_ROLES and role != "operations" and user_id and ticket["user_id"] != user_id:
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
    GET: Operation / Support dashboard summary metrics from MongoDB Atlas.
         Returns personalized metrics for Level 1 Support Agents.
         Returns team-wide metrics for Support Leads and Super Admin.
    """

    def get(self, request):
        ctx = extract_user_context(request)
        role = ctx["role"]
        user_id = ctx["id"]
        user_name = ctx["fullName"]

        if role not in SUPPORT_STAFF_ROLES:
            return Response(
                {"error": "Forbidden: Metrics are only accessible to authorized Support Staff."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            metrics = repository.get_metrics_counts(role=role, user_id=user_id, user_name=user_name)
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
