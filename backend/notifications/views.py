"""
Notifications Views — MongoDB Atlas Integration
================================================
Database-backed user notifications with read status tracking in MongoDB Atlas.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from starcast.db import get_collection
from starcast.utils import handle_db_error, clean_doc

class NotificationListView(APIView):
    """Retrieve notifications or mark all as read in MongoDB Atlas."""
    def get(self, request):
        user_id = request.query_params.get("user_id", "cand-aanya")
        try:
            col = get_collection('notifications')
            # Fetch notifications for user, or general notifications
            query = {"$or": [{"user_id": user_id}, {"user_id": {"$exists": False}}]}
            cursor = col.find(query).sort("timestamp", -1)
            results = [clean_doc(doc) for doc in cursor]

            unread_count = sum(1 for n in results if not n.get("read", False))

            return Response({
                "unread_count": unread_count,
                "results": results
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def post(self, request):
        user_id = request.data.get("user_id") or request.query_params.get("user_id")
        try:
            col = get_collection('notifications')
            query = {"user_id": user_id} if user_id else {}
            col.update_many(query, {"$set": {"read": True}})
            return Response({"message": "All notifications marked as read in database."}, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)
