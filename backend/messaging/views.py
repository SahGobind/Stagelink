from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import datetime
from .serializers import MessageSendSerializer

SAMPLE_MESSAGES = [
    {
        "id": "msg-1",
        "sender_id": "usr-2",
        "sender_name": "Marcus Sterling (Casting Director)",
        "recipient_id": "usr-1",
        "recipient_name": "Elena Rostova",
        "content": "Hi Elena, we reviewed your stunt reel and would love to schedule a chemistry read next Thursday.",
        "timestamp": "2026-10-14T11:00:00Z",
        "read": True
    },
    {
        "id": "msg-2",
        "sender_id": "usr-1",
        "sender_name": "Elena Rostova",
        "recipient_id": "usr-2",
        "recipient_name": "Marcus Sterling",
        "content": "Thank you Marcus! I am fully available and have prepared Scene 3.",
        "timestamp": "2026-10-14T11:35:00Z",
        "read": False
    }
]

class MessageListView(APIView):
    """Retrieve message history between users or send a message."""
    def get(self, request):
        user_id = request.query_params.get("user_id", "usr-1")
        convo = [
            m for m in SAMPLE_MESSAGES
            if m["sender_id"] == user_id or m["recipient_id"] == user_id
        ]
        return Response({"count": len(convo), "results": convo}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = MessageSendSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        new_msg = {
            "id": f"msg-{len(SAMPLE_MESSAGES) + 1}",
            "sender_id": "usr-1",
            "sender_name": "Current User",
            "recipient_id": data["recipient_id"],
            "recipient_name": "Recipient",
            "content": data["content"],
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "read": False
        }
        SAMPLE_MESSAGES.append(new_msg)
        return Response(new_msg, status=status.HTTP_201_CREATED)
