from rest_framework import serializers

class ApplicationSubmitSerializer(serializers.Serializer):
    opportunity_id = serializers.CharField()
    role_id = serializers.CharField(required=False, default='role-1')
    candidate_id = serializers.CharField(required=False, default='usr-1')
    cover_message = serializers.CharField(required=False, allow_blank=True)
    video_audition_url = serializers.CharField(required=False, allow_blank=True)
    portfolio_url = serializers.CharField(required=False, allow_blank=True)
    answers = serializers.DictField(required=False, default=dict)

class ApplicationStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        'submitted', 'under_review', 'shortlisted',
        'audition_requested', 'selected', 'rejected', 'withdrawn'
    ])
    note = serializers.CharField(required=False, allow_blank=True)

class AuditionInviteSerializer(serializers.Serializer):
    date = serializers.CharField()
    time = serializers.CharField()
    timezone = serializers.CharField(required=False, default='IST')
    mode = serializers.CharField(default='In-Studio Chemistry Read')
    instructions = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    submission_deadline = serializers.CharField(required=False, allow_blank=True)
    private_notes = serializers.CharField(required=False, allow_blank=True)

class ProductionFeedbackSerializer(serializers.Serializer):
    rating = serializers.FloatField(min_value=1.0, max_value=5.0)
    feedback = serializers.CharField(min_length=3)
    breakdown = serializers.DictField(required=False, default=dict)
    reviewer_name = serializers.CharField(required=False, default='Casting Director')
    reviewer_role = serializers.CharField(required=False, default='Lead Studio Reviewer')
    candidate_id = serializers.CharField(required=False, allow_blank=True, default='')
    candidate_name = serializers.CharField(required=False, allow_blank=True, default='')
    production_company = serializers.CharField(required=False, allow_blank=True, default='')
    opportunity_title = serializers.CharField(required=False, allow_blank=True, default='')
    role_title = serializers.CharField(required=False, allow_blank=True, default='')

