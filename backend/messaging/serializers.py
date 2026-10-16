from rest_framework import serializers

class MessageSendSerializer(serializers.Serializer):
    recipient_id = serializers.CharField()
    content = serializers.CharField(max_length=2000)
    opportunity_id = serializers.CharField(required=False, allow_blank=True)

class MessageSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    sender_id = serializers.CharField()
    recipient_id = serializers.CharField()
    content = serializers.CharField()
    timestamp = serializers.CharField()
    read = serializers.BooleanField(default=False)
