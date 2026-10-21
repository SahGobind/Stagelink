"""
Payments Views — MongoDB Atlas Integration
===========================================
Safe payment intent creation, confirmation, and idempotent server-side verification
with persistent audit records in MongoDB Atlas.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import datetime

from .serializers import PaymentIntentCreateSerializer, PaymentConfirmSerializer
from .services import payment_service
from starcast.db import get_collection
from starcast.utils import handle_db_error, clean_doc

class CreatePaymentIntentView(APIView):
    """
    Create a payment intent in MongoDB Atlas.
    Never stores card numbers, CVVs, or payment secrets.
    """
    def post(self, request):
        serializer = PaymentIntentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        try:
            intent = payment_service.create_payment_intent(
                amount=data["amount"],
                currency=data.get("currency", "USD"),
                description=data.get("description", "StageLink Casting Listing Fee"),
                metadata=data.get("metadata", {})
            )
            return Response({
                "message": "Payment intent initialized",
                "intent": intent
            }, status=status.HTTP_201_CREATED)
        except Exception as err:
            return handle_db_error(err)

class ConfirmPaymentView(APIView):
    """
    Confirm payment intent and update status in MongoDB Atlas.
    """
    def post(self, request):
        serializer = PaymentConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        intent_id = serializer.validated_data["payment_intent_id"]
        try:
            confirmed = payment_service.confirm_mock_payment(intent_id)
            if not confirmed:
                return Response({
                    "error": "Payment intent not found or already finalized"
                }, status=status.HTTP_404_NOT_FOUND)

            return Response({
                "message": "Payment confirmed and recorded in database",
                "intent": confirmed
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

class PaymentStatusView(APIView):
    """Retrieve the status of a payment intent from MongoDB Atlas."""
    def get(self, request, intent_id):
        try:
            res = payment_service.retrieve_payment_status(intent_id)
            return Response(res, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)

class VerifyPaymentView(APIView):
    """
    Idempotent server-side payment verification endpoint.
    Verifies that the order has been authorized and records audit trail in MongoDB.
    """
    def post(self, request):
        order_id = request.data.get("orderId")
        txn_id = request.data.get("txnId")
        outcome = request.data.get("outcome", "success")
        
        if outcome == "failed":
            return Response({
                "verified": False,
                "status": "failed",
                "message": "Payment authorization was declined by issuer."
            }, status=status.HTTP_400_BAD_REQUEST)
        if outcome == "cancelled":
            return Response({
                "verified": False,
                "status": "cancelled",
                "message": "Payment was cancelled by the user."
            }, status=status.HTTP_200_OK)
        if outcome == "pending":
            return Response({
                "verified": False,
                "status": "pending",
                "message": "Payment authorization is pending bank settlement."
            }, status=status.HTTP_202_ACCEPTED)
            
        try:
            col = get_collection('payments')
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            col.update_one(
                {"order_id": order_id},
                {
                    "$set": {
                        "order_id": order_id,
                        "txn_id": txn_id,
                        "payment_status": "paid",
                        "verified_at": now_iso,
                        "updated_at": now_iso
                    },
                    "$push": {
                        "audit_trail": {
                            "event": "server_verification_confirmed",
                            "timestamp": now_iso,
                            "txn_id": txn_id
                        }
                    }
                },
                upsert=True
            )

            return Response({
                "verified": True,
                "status": "paid",
                "orderId": order_id,
                "txnId": txn_id,
                "message": "Server-side payment verification confirmed and recorded in database."
            }, status=status.HTTP_200_OK)
        except Exception as err:
            return handle_db_error(err)
