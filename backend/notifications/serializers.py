from rest_framework import serializers

class NotificationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    message = serializers.CharField()
    type = serializers.ChoiceField(choices=['shortlist', 'audition', 'status_update', 'general'])
    read = serializers.BooleanField(default=False)
    timestamp = serializers.CharField()
    link = serializers.CharField(required=False, allow_blank=True)
