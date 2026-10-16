from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import datetime
from .serializers import ApplicationSubmitSerializer, ApplicationStatusUpdateSerializer, AuditionInviteSerializer

SAMPLE_APPLICATIONS = [
    {
        "id": "app-101",
        "opportunity_id": "opp-1",
        "opportunity_title": "Echoes of the Crown",
        "role_id": "role-1",
        "role_title": "Major Anya Petrova (Lead Agent)",
        "production_company": "Apex Vision Studios",
        "candidate_id": "usr-1",
        "candidate_name": "Elena Rostova",
        "candidate_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        "candidate_headline": "Action & Dramatic Lead Screen Actress",
        "location": "London, UK",
        "status": "shortlisted",
        "applied_date": "2026-10-12T14:30:00Z",
        "cover_message": "Fluent in English and Russian with certified martial arts and stunt driving training. Ready for European shoot schedule.",
        "video_audition_url": "https://www.w3schools.com/html/mov_bbb.mp4",
        "match_score_value": 88
    },
    {
        "id": "app-102",
        "opportunity_id": "opp-1",
        "opportunity_title": "Echoes of the Crown",
        "role_id": "role-1",
        "role_title": "Major Anya Petrova (Lead Agent)",
        "production_company": "Apex Vision Studios",
        "candidate_id": "usr-3",
        "candidate_name": "Sophia Lin",
        "candidate_avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
        "candidate_headline": "Stunt Performer & Theatrical Artist",
        "location": "Budapest, Hungary",
        "status": "under_review",
        "applied_date": "2026-10-13T10:15:00Z",
        "cover_message": "Local resident in Budapest. 6 years theatrical stage combat and fencing.",
        "video_audition_url": "https://www.w3schools.com/html/mov_bbb.mp4",
        "match_score_value": 79
    }
]

class ApplicationListView(APIView):
    """List applications or submit a new application."""
    def get(self, request):
        opp_id = request.query_params.get("opportunity_id")
        candidate_id = request.query_params.get("candidate_id")
        app_status = request.query_params.get("status")

        results = SAMPLE_APPLICATIONS
        if opp_id:
            results = [a for a in results if a["opportunity_id"] == opp_id]
        if candidate_id:
            results = [a for a in results if a["candidate_id"] == candidate_id]
        if app_status and app_status != 'all':
            results = [a for a in results if a["status"] == app_status]

        return Response({"count": len(results), "results": results}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ApplicationSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        new_app = {
            "id": f"app-{len(SAMPLE_APPLICATIONS) + 101}",
            "opportunity_id": data["opportunity_id"],
            "opportunity_title": "Echoes of the Crown",
            "role_id": data.get("role_id", "role-1"),
            "role_title": "Major Anya Petrova (Lead Agent)",
            "production_company": "Apex Vision Studios",
            "candidate_id": data.get("candidate_id", "usr-1"),
            "candidate_name": "Elena Rostova",
            "candidate_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
            "candidate_headline": "Action & Dramatic Lead Screen Actress",
            "location": "London, UK",
            "status": "submitted",
            "applied_date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "cover_message": data.get("cover_message", ""),
            "video_audition_url": data.get("video_audition_url", ""),
            "match_score_value": 85
        }
        SAMPLE_APPLICATIONS.append(new_app)
        return Response({
            "message": "Application submitted successfully",
            "application": new_app
        }, status=status.HTTP_201_CREATED)

class ApplicationDetailView(APIView):
    """Retrieve or update single application."""
    def get(self, request, pk):
        app = next((a for a in SAMPLE_APPLICATIONS if a["id"] == pk), None)
        if not app:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(app, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        app = next((a for a in SAMPLE_APPLICATIONS if a["id"] == pk), None)
        if not app:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ApplicationStatusUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        app["status"] = serializer.validated_data["status"]
        if "note" in serializer.validated_data:
            app["internal_note"] = serializer.validated_data["note"]
            
        return Response({
            "message": f"Application status updated to {app['status']}",
            "application": app
        }, status=status.HTTP_200_OK)

class AuditionInviteView(APIView):
    """Invite candidate to audition chemistry read."""
    def post(self, request, pk):
        app = next((a for a in SAMPLE_APPLICATIONS if a["id"] == pk), None)
        if not app:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AuditionInviteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        invite_data = serializer.validated_data
        app["status"] = "audition_requested"
        app["audition_invitation"] = {
            "date": invite_data["date"],
            "time": invite_data["time"],
            "mode": invite_data["mode"],
            "notes": invite_data.get("notes", "Prepare Scene 3 monologue.")
        }
        return Response({
            "message": "Audition invitation dispatched successfully",
            "application": app
        }, status=status.HTTP_200_OK)

class TalentMyApplicationsView(APIView):
    """Privacy-safe candidate endpoint for own submitted applications."""
    def get(self, request):
        candidate_id = request.query_params.get("candidate_id", "usr-1")
        my_apps = [a for a in SAMPLE_APPLICATIONS if a["candidate_id"] == candidate_id]
        
        # Privacy filter: exclude internal recruiter notes and competitor data
        safe_apps = []
        for a in my_apps:
            safe = {
                "id": a["id"],
                "opportunity_id": a["opportunity_id"],
                "opportunity_title": a["opportunity_title"],
                "role_id": a["role_id"],
                "role_title": a["role_title"],
                "production_company": a["production_company"],
                "status": a["status"],
                "applied_date": a["applied_date"],
                "audition_invitation": a.get("audition_invitation"),
                "matched_requirements": [
                    "Martial Arts (Advanced)",
                    "Stunt Driving (Level 2)",
                    "Fluent Russian & English",
                    "UK Working Rights & Proximity"
                ],
                "improvement_suggestions": [
                    "Upload a dedicated firearms handling demonstration clip to raise combat verification score."
                ]
            }
            safe_apps.append(safe)
            
        return Response({"count": len(safe_apps), "results": safe_apps}, status=status.HTTP_200_OK)
