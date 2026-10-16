from rest_framework import serializers

class CastingRoleSerializer(serializers.Serializer):
    id = serializers.CharField(required=False)
    title = serializers.CharField(max_length=150)
    category = serializers.CharField(default='Lead Actor')
    gender = serializers.CharField(required=False, default='Any')
    age_range = serializers.CharField(required=False, default='25-38')
    description = serializers.CharField(required=False, allow_blank=True)
    required_skills = serializers.ListField(child=serializers.CharField(), default=list)
    required_languages = serializers.ListField(child=serializers.CharField(), default=list)
    min_experience_years = serializers.IntegerField(default=3)
    rate = serializers.CharField(required=False, default='SAG-AFTRA Scale + 15%')

class CastingOpportunitySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=200)
    production_company = serializers.CharField(max_length=150)
    category = serializers.CharField(default='Feature Film')
    type = serializers.CharField(default='Union / SAG-AFTRA')
    location = serializers.CharField(max_length=150)
    travel_covered = serializers.BooleanField(default=True)
    description = serializers.CharField(required=False, allow_blank=True)
    shooting_dates = serializers.CharField(default='Nov 15, 2026 – Feb 20, 2027')
    application_deadline = serializers.CharField(default='2026-10-30')
    status = serializers.ChoiceField(choices=['active', 'casting', 'closed', 'draft'], default='active')
    roles = CastingRoleSerializer(many=True, default=list)
    applicant_count = serializers.IntegerField(default=0)
    shortlisted_count = serializers.IntegerField(default=0)
