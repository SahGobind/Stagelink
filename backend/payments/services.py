"""
Payment Service — MongoDB Atlas Integration
============================================
Handles payment intents, transaction auditing, and state tracking
persisted to MongoDB Atlas. Never stores card numbers or CVVs.
"""

from abc import ABC, abstractmethod
import uuid
import datetime
from starcast.db import get_collection
from starcast.utils import clean_doc

class PaymentGatewayInterface(ABC):
    """Abstract interface defining required contract for payment providers."""

    @abstractmethod
    def create_payment_intent(self, amount, currency, description, metadata=None):
        """Create a payment intent."""
        pass

    @abstractmethod
    def retrieve_payment_status(self, payment_intent_id):
        """Check status of a payment intent."""
        pass


class MongoDBPaymentService(PaymentGatewayInterface):
    """
    MongoDB-backed payment service interface.
    Stores and audits transaction records securely in MongoDB Atlas.
    """
    def __init__(self, sandbox_mode=True):
        self.sandbox_mode = sandbox_mode

    def _get_col(self):
        return get_collection('payments')

    def create_payment_intent(self, amount, currency='USD', description='', metadata=None):
        intent_id = f"pi_test_{uuid.uuid4().hex[:16]}"
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        intent = {
            "id": intent_id,
            "order_id": intent_id,
            "amount": float(amount),
            "currency": currency.upper(),
            "description": description,
            "status": "requires_mock_confirmation",
            "payment_status": "pending",
            "client_secret": f"{intent_id}_secret_test",
            "is_sandbox": self.sandbox_mode,
            "created_at": now_iso,
            "disclaimer": "TEST SANDBOX ONLY: No sensitive card credentials stored.",
            "metadata": metadata or {},
            "audit_trail": [
                {"event": "intent_created", "timestamp": now_iso, "status": "pending"}
            ]
        }
        col = self._get_col()
        col.insert_one(intent)
        return clean_doc(intent)

    def retrieve_payment_status(self, payment_intent_id):
        col = self._get_col()
        doc = col.find_one({"$or": [{"id": payment_intent_id}, {"order_id": payment_intent_id}]})
        if not doc:
            return {
                "id": payment_intent_id,
                "status": "not_found",
                "is_sandbox": self.sandbox_mode,
                "error": "Payment intent ID does not exist in database."
            }
        return clean_doc(doc)

    def confirm_mock_payment(self, payment_intent_id):
        col = self._get_col()
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        query = {"$or": [{"id": payment_intent_id}, {"order_id": payment_intent_id}]}
        doc = col.find_one(query)
        if doc:
            col.update_one(
                query,
                {
                    "$set": {
                        "status": "mock_succeeded",
                        "payment_status": "succeeded",
                        "confirmed_at": now_iso,
                        "updated_at": now_iso
                    },
                    "$push": {
                        "audit_trail": {
                            "event": "payment_confirmed",
                            "timestamp": now_iso,
                            "status": "succeeded"
                        }
                    }
                }
            )
            updated = col.find_one(query)
            return clean_doc(updated)
        return None

# Singleton instance backed by MongoDB Atlas
payment_service = MongoDBPaymentService()
