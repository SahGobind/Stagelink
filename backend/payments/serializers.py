from rest_framework import serializers

class PaymentIntentCreateSerializer(serializers.Serializer):
    amount = serializers.FloatField(min_value=1.0)
    currency = serializers.CharField(max_length=3, default='USD')
    description = serializers.CharField(required=False, default='StageLink Production Casting Deposit')
    metadata = serializers.DictField(required=False, default=dict)

class PaymentConfirmSerializer(serializers.Serializer):
    payment_intent_id = serializers.CharField()
