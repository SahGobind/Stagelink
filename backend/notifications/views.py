from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

SAMPLE_NOTIFICATIONS = [
    {
        "id": "notif-1",
        "title": "Application Shortlisted!",
        "message": "Apex Vision Studios shortlisted your application for 'Major Anya Petrova' in Echoes of the Crown.",
        "type": "shortlist",
        "read": False,
        "timestamp": "2026-10-14T09:12:00Z",
        "link": "/candidate/applications/app-101"
    },
    {
        "id": "notif-2",
        "title": "Audition Callback Invited",
        "message": "You have an audition invitation scheduled for Thursday at 14:00.",
        "type": "audition",
        "read": False,
        "timestamp": "2026-10-14T11:05:00Z",
        "link": "/candidate/applications/app-101"
    }
]

class NotificationListView(APIView):
    """Retrieve notifications or mark all as read."""
    def get(self, request):
        return Response({
            "unread_count": sum(1 for n in SAMPLE_NOTIFICATIONS if not n["read"]),
            "results": SAMPLE_NOTIFICATIONS
        }, status=status.HTTP_200_OK)

    def post(self, request):
        # Mark all read
        for n in SAMPLE_NOTIFICATIONS:
            n["read"] = True
        return Response({"message": "All notifications marked as read"}, status=status.HTTP_200_OK)
