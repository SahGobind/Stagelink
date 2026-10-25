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
    ProductionFeedbackSerializer,
)
from . import repository
from starcast.utils import handle_db_error, clean_doc, get_auth_user_from_request
from starcast.rbac import Permissions, user_has_permission
from starcast.permissions import check_permission
from starcast.audit import log_audit_event

def check_application_access(request, app, allow_candidate=True, allow_recruiter=True, admin_permission=Permissions.APPLICATION_VIEW_ALL):
    """
    Validates that the authenticated user owns this application as applicant or opportunity recruiter,
    or possesses administrative override permission.
    Prevents IDOR across candidate submissions.
    """
    auth_user = getattr(request, "auth_user", None) or get_auth_user_from_request(request)
    if not auth_user:
        return None, Response({
            "error": "Authentication required to access application.",
            "code": "AUTHENTICATION_REQUIRED"
        }, status=status.HTTP_401_UNAUTHORIZED)

    role = auth_user.get("role", "guest")
    user_id = str(auth_user.get("id", ""))

    # 1. Super Admin or Admin with permission
    if role == "super_admin" or (admin_permission and user_has_permission(auth_user, admin_permission)):
        return auth_user, None

    # 2. Check Candidate ownership
    if allow_candidate and str(app.get("candidate_id", "")).lower() == user_id.lower():
        return auth_user, None

    # 3. Check Recruiter ownership (by opportunity)
    if allow_recruiter and role in ("recruiter", "admin"):
        from opportunities import repository as opp_repo
        opp = opp_repo.find_opportunity_by_id(app.get("opportunity_id"))
        if opp:
            recruiter_ids = {
                str(opp.get("recruiterId", "")).lower(),
                str(opp.get("recruiter_id", "")).lower(),
                str(opp.get("recruiterEmail", "")).lower(),
                str(opp.get("productionCompany", "")).lower(),
                str(opp.get("production_company", "")).lower(),
            }
            user_tokens = {
                user_id.lower(),
                str(auth_user.get("email", "")).lower(),
                str(auth_user.get("companyName", "")).lower(),
                str(auth_user.get("company_name", "")).lower(),
            }
            user_tokens.discard("")
            if recruiter_ids.intersection(user_tokens):
                return auth_user, None

    # Log IDOR attempt
    log_audit_event(
        action="IDOR_ATTEMPT_BLOCKED",
        actor=auth_user,
        resource_type="application",
        resource_id=app.get("id"),
        status="DENIED",
        reason=f"User {user_id} lacks access to application {app.get('id')}",
        request=request
    )
    return None, Response({
        "error": "You are not authorized to access or modify this application.",
        "code": "FORBIDDEN_RESOURCE_ACCESS"
    }, status=status.HTTP_403_FORBIDDEN)


class ApplicationListView(APIView):
    """List applications with filters or submit a new candidate application backed by MongoDB."""
    def get(self, request):
        auth_user = get_auth_user_from_request(request)
        if not auth_user:
            return Response({
                "error": "Authentication required to view applications.",
                "code": "AUTHENTICATION_REQUIRED"
            }, status=status.HTTP_401_UNAUTHORIZED)

        opp_id = request.query_params.get("opportunity_id")
        candidate_id = request.query_params.get("candidate_id")
        app_status = request.query_params.get("status")

        role = auth_user.get("role", "guest")
        # Enforce data isolation: candidates can only see their own applications
        if role in ("candidate", "talent", "user") and not user_has_permission(auth_user, Permissions.APPLICATION_VIEW_ALL):
            candidate_id = auth_user.get("id")

        try:
            results = repository.list_applications(
                opportunity_id=opp_id,
                candidate_id=candidate_id,
                status=app_status
            )

            # If recruiter without application:view_all, verify they own the opportunity
            if role == "recruiter" and not user_has_permission(auth_user, Permissions.APPLICATION_VIEW_ALL):
                from opportunities import repository as opp_repo
                user_id = str(auth_user.get("id", ""))
                user_email = str(auth_user.get("email", "")).lower()
                user_comp = str(auth_user.get("companyName", "") or auth_user.get("company_name", "")).lower()

                # Filter out applications belonging to other recruiters' opportunities
                allowed = []
                for a in results:
                    opp = opp_repo.find_opportunity_by_id(a.get("opportunity_id"))
                    if opp:
                        rec_ids = {
                            str(opp.get("recruiterId", "")).lower(),
                            str(opp.get("recruiter_id", "")).lower(),
                            str(opp.get("recruiterEmail", "")).lower(),
                            str(opp.get("productionCompany", "")).lower(),
                            str(opp.get("production_company", "")).lower(),
                        }
                        tokens = {user_id.lower(), user_email, user_comp}
                        tokens.discard("")
                        if rec_ids.intersection(tokens):
                            allowed.append(a)
                results = allowed

            return Response({"count": len(results), "results": results}, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def post(self, request):
        perm_error = check_permission(request, Permissions.APPLICATION_CREATE, resource_type="application")
        if perm_error:
            return perm_error

        serializer = ApplicationSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        auth_user = getattr(request, "auth_user", None) or get_auth_user_from_request(request)

        # Enforce candidate identity binding: Candidates cannot submit applications on behalf of other candidates
        if auth_user and auth_user.get("role") in ("candidate", "talent", "user"):
            candidate_id = auth_user.get("id")
        else:
            candidate_id = data.get("candidate_id") or (auth_user.get("id") if auth_user else "cand-aanya")

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

            auth_user, err_resp = check_application_access(
                request, app, allow_candidate=True, allow_recruiter=True, admin_permission=Permissions.APPLICATION_VIEW_ALL
            )
            if err_resp:
                return err_resp

            return Response(app, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def patch(self, request, pk):
        try:
            app = repository.find_application_by_id(pk)
            if not app:
                return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Updating application status requires recruiter ownership or admin permission
            auth_user, err_resp = check_application_access(
                request, app, allow_candidate=False, allow_recruiter=True, admin_permission=Permissions.APPLICATION_UPDATE_STATUS
            )
            if err_resp:
                return err_resp

            serializer = ApplicationStatusUpdateSerializer(data=request.data, partial=True)
            if not serializer.is_valid():
                return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            
            updates = {"status": serializer.validated_data["status"]}
            if "note" in serializer.validated_data:
                updates["internal_notes"] = serializer.validated_data["note"]

            updated = repository.update_application(pk, updates)
            log_audit_event(
                action="APPLICATION_STATUS_UPDATED",
                actor=auth_user,
                resource_type="application",
                resource_id=pk,
                status="SUCCESS",
                details={"new_status": updated["status"]},
                request=request
            )
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
            
            # Only applicant or admin can withdraw
            auth_user, err_resp = check_application_access(
                request, app, allow_candidate=True, allow_recruiter=False, admin_permission=Permissions.APPLICATION_DELETE_ALL
            )
            if err_resp:
                return err_resp

            updated = repository.update_application(pk, {
                "status": "withdrawn",
                "withdrawn_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            })
            log_audit_event(
                action="APPLICATION_WITHDRAWN",
                actor=auth_user,
                resource_type="application",
                resource_id=pk,
                status="SUCCESS",
                request=request
            )
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
            
            # Only recruiter or admin can dispatch audition invite
            auth_user, err_resp = check_application_access(
                request, app, allow_candidate=False, allow_recruiter=True, admin_permission=Permissions.APPLICATION_UPDATE_STATUS
            )
            if err_resp:
                return err_resp

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
            log_audit_event(
                action="AUDITION_INVITE_DISPATCHED",
                actor=auth_user,
                resource_type="application",
                resource_id=pk,
                status="SUCCESS",
                request=request
            )
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
                    "production_feedback": a.get("production_feedback"),
                    "company_feedback": a.get("company_feedback"),
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


class ApplicationFeedbackView(APIView):
    """Production company feedback and rating on a candidate's audition/production submission."""
    def get(self, request, pk):
        try:
            app = repository.find_application_by_id(pk)
            if app and "production_feedback" in app:
                return Response(app.get("production_feedback", {}), status=status.HTTP_200_OK)
            
            # Check candidate_reviews collection fallback
            from starcast.db import get_collection
            rev_col = get_collection('candidate_reviews')
            found = rev_col.find_one({"application_id": pk})
            if found:
                return Response(clean_doc(found), status=status.HTTP_200_OK)
            return Response({}, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def post(self, request, pk):
        try:
            serializer = ProductionFeedbackSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

            data = serializer.validated_data
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
            app = repository.find_application_by_id(pk) or {}

            candidate_id = data.get("candidate_id") or app.get("candidate_id") or "cand-1"
            candidate_name = data.get("candidate_name") or app.get("candidate_name") or "Talent Candidate"
            production_company = data.get("production_company") or app.get("production_company") or "Casting Studio"
            opportunity_title = data.get("opportunity_title") or app.get("opportunity_title") or "Audition Submission"
            role_title = data.get("role_title") or app.get("role_title") or "Featured Role"

            feedback_payload = {
                "id": f"fb-{int(datetime.datetime.now().timestamp() * 1000)}",
                "application_id": pk,
                "candidate_id": candidate_id,
                "candidate_name": candidate_name,
                "production_company": production_company,
                "opportunity_title": opportunity_title,
                "role_title": role_title,
                "rating": float(data["rating"]),
                "feedback": data["feedback"],
                "breakdown": data.get("breakdown") or {
                    "acting": data["rating"],
                    "screen_presence": data["rating"],
                    "vocal_delivery": data["rating"],
                    "professionalism": data["rating"]
                },
                "reviewer_name": data.get("reviewer_name", "Casting Director"),
                "reviewer_role": data.get("reviewer_role", "Lead Studio Reviewer"),
                "given_at": now_iso
            }

            # If application exists in MongoDB, update it
            updated_app = None
            if app:
                try:
                    updated_app = repository.update_application(pk, {
                        "production_feedback": feedback_payload
                    })
                except Exception:
                    pass

            # Persist in candidate_reviews collection for candidate's public profile
            from starcast.db import get_collection
            rev_col = get_collection('candidate_reviews')
            rev_col.update_one(
                {"application_id": pk},
                {"$set": feedback_payload},
                upsert=True
            )

            return Response({
                "message": "Production submission feedback and rating saved successfully",
                "application": updated_app or {"id": pk, "production_feedback": feedback_payload},
                "feedback": feedback_payload
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)



class CandidateReviewsView(APIView):
    """List all verified studio feedback and ratings for a candidate."""
    def get(self, request, candidate_id):
        try:
            from starcast.db import get_collection
            rev_col = get_collection('candidate_reviews')
            cursor = rev_col.find({"candidate_id": candidate_id}).sort("given_at", -1)
            reviews = [clean_doc(doc) for doc in cursor]

            avg = round(sum(r.get("rating", 5) for r in reviews) / len(reviews), 1) if reviews else 5.0
            return Response({
                "candidate_id": candidate_id,
                "average_rating": avg,
                "total_reviews": len(reviews),
                "reviews": reviews
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

