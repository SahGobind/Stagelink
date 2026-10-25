from rest_framework import serializers

class ProductionCompanySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=200)
    industry = serializers.CharField(default='Feature Film & Television')
    location = serializers.CharField(max_length=150)
    website = serializers.URLField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    verified = serializers.BooleanField(default=True)
    active_projects_count = serializers.IntegerField(default=1)

class CompanyReviewSerializer(serializers.Serializer):
    candidate_id = serializers.CharField(max_length=100)
    candidate_name = serializers.CharField(max_length=200)
    candidate_avatar = serializers.CharField(required=False, allow_blank=True)
    rating = serializers.FloatField(min_value=1.0, max_value=5.0)
    feedback = serializers.CharField(min_length=3)
    opportunity_id = serializers.CharField(required=False, allow_blank=True)
    opportunity_title = serializers.CharField(required=False, allow_blank=True)
    categories = serializers.DictField(required=False, default=dict)

