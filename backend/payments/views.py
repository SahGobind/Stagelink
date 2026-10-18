from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PaymentIntentCreateSerializer, PaymentConfirmSerializer
from .services import payment_service

class CreatePaymentIntentView(APIView):
    """
    Create a mock payment intent for testing UI checkouts.
    TEST INTERFACE ONLY: No real funds or financial transactions.
    """
    def post(self, request):
        serializer = PaymentIntentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        intent = payment_service.create_payment_intent(
            amount=data["amount"],
            currency=data.get("currency", "USD"),
            description=data.get("description", "StageLink Casting Test Fee"),
            metadata=data.get("metadata", {})
        )
        return Response({
            "message": "Mock payment intent initialized (Test sandbox only; no real charge)",
            "intent": intent
        }, status=status.HTTP_201_CREATED)

class ConfirmPaymentView(APIView):
    """
    Confirm a mock test payment for frontend flow verification.
    """
    def post(self, request):
        serializer = PaymentConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        intent_id = serializer.validated_data["payment_intent_id"]
        confirmed = payment_service.confirm_mock_payment(intent_id)
        if not confirmed:
            return Response({
                "error": "Payment intent not found or already finalized"
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "message": "Mock payment confirmed for testing purposes",
            "intent": confirmed
        }, status=status.HTTP_200_OK)

class PaymentStatusView(APIView):
    """Retrieve the status of a mock test payment intent."""
    def get(self, request, intent_id):
        res = payment_service.retrieve_payment_status(intent_id)
        return Response(res, status=status.HTTP_200_OK)
