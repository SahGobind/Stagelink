"""
Applications Views — MongoDB Atlas Integration
===============================================
Database-backed candidate audition applications, duplicate prevention,
status updates, and privacy-safe candidate endpoints.
"""

import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    ApplicationSubmitSerializer,
    ApplicationStatusUpdateSerializer,
    AuditionInviteSerializer,
)
from . import repository
from starcast.utils import handle_db_error, clean_doc

class ApplicationListView(APIView):
    """List applications with filters or submit a new candidate application backed by MongoDB."""
    def get(self, request):
        opp_id = request.query_params.get("opportunity_id")
        candidate_id = request.query_params.get("candidate_id")
        app_status = request.query_params.get("status")

        try:
            results = repository.list_applications(
                opportunity_id=opp_id,
                candidate_id=candidate_id,
                status=app_status
            )
            return Response({"count": len(results), "results": results}, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def post(self, request):
        serializer = ApplicationSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        candidate_id = data.get("candidate_id", "cand-aanya")
        opp_id = data.get("opportunity_id")

        try:
            # 1. Prevent duplicate applications
            duplicate = repository.find_duplicate_application(candidate_id, opp_id)
            if duplicate:
                return Response({
                    "error": "You have already applied to this casting opportunity.",
                    "code": "DUPLICATE_APPLICATION",
                    "existing_id": duplicate["id"],
                    "status": duplicate["status"]
                }, status=status.HTTP_400_BAD_REQUEST)
            
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            app_id = f"app-{int(datetime.datetime.now().timestamp() * 1000)}"

            new_app = {
                "id": app_id,
                "opportunity_id": opp_id,
                "opportunity_title": request.data.get("opportunity_title", "Casting Call Opportunity"),
                "role_id": data.get("role_id", "role-1"),
                "role_title": request.data.get("role_title", "Primary Character Role"),
                "production_company": request.data.get("production_company", "StageLink Partner Studio"),
                "candidate_id": candidate_id,
                "candidate_name": request.data.get("candidate_name", "StageLink Performer"),
                "candidate_avatar": request.data.get("candidate_avatar", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"),
                "candidate_headline": request.data.get("candidate_headline", "Action & Dramatic Lead Screen Actress"),
                "location": request.data.get("location", "London, UK"),
                "status": "submitted",
                "applied_date": now_iso,
                "cover_message": data.get("cover_message", ""),
                "video_audition_url": data.get("video_audition_url", ""),
                "portfolio_url": data.get("portfolio_url", ""),
                "answers": data.get("answers", {}),
                "match_score_value": 85,
                "internal_notes": ""
            }

            created = repository.create_application(new_app)
            return Response({
                "message": "Application submitted successfully",
                "application": created
            }, status=status.HTTP_201_CREATED)
        except Exception as err:
            return handle_db_error(err)


class ApplicationDetailView(APIView):
    """Retrieve or update a single application in MongoDB."""
    def get(self, request, pk):
        try:
            app = repository.find_application_by_id(pk)
            if not app:
                return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(app, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def patch(self, request, pk):
        try:
            app = repository.find_application_by_id(pk)
            if not app:
                return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = ApplicationStatusUpdateSerializer(data=request.data, partial=True)
            if not serializer.is_valid():
                return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            
            updates = {"status": serializer.validated_data["status"]}
            if "note" in serializer.validated_data:
                updates["internal_notes"] = serializer.validated_data["note"]

            updated = repository.update_application(pk, updates)
            return Response({
                "message": f"Application status updated to {updated['status']}",
                "application": updated
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class ApplicationWithdrawView(APIView):
    """Allow candidate to withdraw their own application."""
    def post(self, request, pk):
        try:
            app = repository.find_application_by_id(pk)
            if not app:
                return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
            
            updated = repository.update_application(pk, {
                "status": "withdrawn",
                "withdrawn_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            })
            return Response({
                "message": "Application withdrawn successfully",
                "application": updated
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class AuditionInviteView(APIView):
    """Invite candidate to audition / callback with full schedule specifications."""
    def post(self, request, pk):
        try:
            app = repository.find_application_by_id(pk)
            if not app:
                return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = AuditionInviteSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            
            invite_data = serializer.validated_data
            updates = {
                "status": "audition_requested",
                "audition_invitation": {
                    "date": invite_data["date"],
                    "time": invite_data["time"],
                    "timezone": invite_data.get("timezone", "IST"),
                    "mode": invite_data["mode"],
                    "notes": invite_data.get("instructions") or invite_data.get("notes", "Prepare Scene sides."),
                    "submission_deadline": invite_data.get("submission_deadline", "")
                }
            }
            if invite_data.get("private_notes"):
                updates["internal_notes"] = invite_data["private_notes"]

            updated = repository.update_application(pk, updates)
            return Response({
                "message": "Audition invitation dispatched successfully",
                "application": updated
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)


class TalentMyApplicationsView(APIView):
    """Privacy-safe candidate endpoint for own submitted applications. NEVER exposes internal recruiter notes."""
    def get(self, request):
        candidate_id = request.query_params.get("candidate_id", "cand-aanya")
        try:
            my_apps = repository.list_applications(candidate_id=candidate_id)
            safe_apps = []
            for a in my_apps:
                safe = {
                    "id": a["id"],
                    "opportunity_id": a["opportunity_id"],
                    "opportunity_title": a["opportunity_title"],
                    "role_id": a.get("role_id"),
                    "role_title": a.get("role_title"),
                    "production_company": a.get("production_company"),
                    "status": a["status"],
                    "applied_date": a.get("applied_date"),
                    "audition_invitation": a.get("audition_invitation"),
                }
                # Strictly omit internal_notes from candidate view
                safe_apps.append(safe)
                
            return Response({
                "candidate_id": candidate_id,
                "count": len(safe_apps),
                "applications": safe_apps
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)
