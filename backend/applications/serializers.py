from rest_framework import serializers

class ApplicationSubmitSerializer(serializers.Serializer):
    opportunity_id = serializers.CharField()
    role_id = serializers.CharField(required=False, default='role-1')
    candidate_id = serializers.CharField(required=False, default='usr-1')
    cover_message = serializers.CharField(required=False, allow_blank=True)
    video_audition_url = serializers.URLField(required=False, allow_blank=True)

class ApplicationStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        'submitted', 'under_review', 'shortlisted',
        'audition_requested', 'selected', 'rejected', 'withdrawn'
    ])
    note = serializers.CharField(required=False, allow_blank=True)

class AuditionInviteSerializer(serializers.Serializer):
    date = serializers.CharField()
    time = serializers.CharField()
    mode = serializers.CharField(default='In-Studio Chemistry Read')
    notes = serializers.CharField(required=False, allow_blank=True)
