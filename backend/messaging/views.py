"""
Messaging Views — MongoDB Atlas Integration
============================================
Direct talent-recruiter messages stored in MongoDB Atlas 'messages' collection.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import datetime
from .serializers import MessageSendSerializer
from starcast.db import get_collection
from starcast.utils import handle_db_error, clean_doc

class MessageListView(APIView):
    """Retrieve message history between users or send a message in MongoDB Atlas."""
    def get(self, request):
        user_id = request.query_params.get("user_id", "usr-1")
        try:
            col = get_collection('messages')
            cursor = col.find({"$or": [{"sender_id": user_id}, {"recipient_id": user_id}]}).sort("timestamp", 1)
            results = [clean_doc(doc) for doc in cursor]
            return Response({"count": len(results), "results": results}, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

    def post(self, request):
        serializer = MessageSendSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        sender_id = request.data.get("sender_id", "usr-1")
        sender_name = request.data.get("sender_name", "Current User")
        
        try:
            col = get_collection('messages')
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            new_msg = {
                "id": f"msg-{int(datetime.datetime.now().timestamp() * 1000)}",
                "sender_id": sender_id,
                "sender_name": sender_name,
                "recipient_id": data["recipient_id"],
                "recipient_name": request.data.get("recipient_name", "Recipient"),
                "content": data["content"],
                "timestamp": now_iso,
                "read": False
            }
            col.insert_one(new_msg)
            return Response(clean_doc(new_msg), status=status.HTTP_201_CREATED)
        except Exception as err:
            return handle_db_error(err)
