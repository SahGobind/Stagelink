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
