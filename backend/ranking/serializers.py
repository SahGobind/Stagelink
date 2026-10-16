from rest_framework import serializers

class MatchScoreBreakdownSerializer(serializers.Serializer):
    criterion_key = serializers.CharField()
    criterion_name = serializers.CharField()
    max_points = serializers.FloatField()
    points_awarded = serializers.FloatField()
    evidence_used = serializers.CharField()
    missing_or_uncertainty = serializers.CharField(allow_null=True)

class RoleMatchScoreSerializer(serializers.Serializer):
    total_score = serializers.FloatField()
    status = serializers.CharField()
    confidence_level = serializers.CharField()
    missing_fields = serializers.ListField(child=serializers.CharField())
    improvement_suggestions = serializers.ListField(child=serializers.CharField())
    calculation_summary = serializers.CharField()
    breakdowns = MatchScoreBreakdownSerializer(many=True)

class BulkShortlistSerializer(serializers.Serializer):
    application_ids = serializers.ListField(child=serializers.CharField())
    notes = serializers.CharField(required=False, allow_blank=True)

class CriteriaWeightUpdateSerializer(serializers.Serializer):
    skills = serializers.FloatField(required=False)
    portfolio = serializers.FloatField(required=False)
    experience = serializers.FloatField(required=False)
    language = serializers.FloatField(required=False)
    availability = serializers.FloatField(required=False)
    location = serializers.FloatField(required=False)
