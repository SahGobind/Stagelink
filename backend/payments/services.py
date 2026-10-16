"""
Testable Payment Service Interface.
Purely mock sandbox interface for development and frontend testing.
Does not initiate real payments or claim that transactions are verified.
"""
from abc import ABC, abstractmethod
import uuid
import datetime

class PaymentGatewayInterface(ABC):
    """Abstract interface defining required contract for payment providers."""

    @abstractmethod
    def create_payment_intent(self, amount, currency, description, metadata=None):
        """Create a mock test payment intent."""
        pass

    @abstractmethod
    def retrieve_payment_status(self, payment_intent_id):
        """Check status of a test payment intent."""
        pass


class MockTestablePaymentService(PaymentGatewayInterface):
    """
    Testable in-memory payment service.
    NOTE: Real financial transactions are strictly disabled.
    """
    def __init__(self, sandbox_mode=True):
        self.sandbox_mode = sandbox_mode
        self._intents = {}

    def create_payment_intent(self, amount, currency='USD', description='', metadata=None):
        intent_id = f"pi_test_{uuid.uuid4().hex[:16]}"
        intent = {
            "id": intent_id,
            "amount": float(amount),
            "currency": currency.upper(),
            "description": description,
            "status": "requires_mock_confirmation",
            "client_secret": f"{intent_id}_secret_test",
            "is_sandbox": True,
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "disclaimer": "TEST SANDBOX ONLY: No real payment processed.",
            "metadata": metadata or {}
        }
        self._intents[intent_id] = intent
        return intent

    def retrieve_payment_status(self, payment_intent_id):
        intent = self._intents.get(payment_intent_id)
        if not intent:
            return {
                "id": payment_intent_id,
                "status": "not_found",
                "is_sandbox": True,
                "error": "Payment intent ID does not exist in test memory."
            }
        return intent

    def confirm_mock_payment(self, payment_intent_id):
        intent = self._intents.get(payment_intent_id)
        if intent:
            intent["status"] = "mock_succeeded"
            intent["confirmed_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            return intent
        return None

# Singleton instance for in-memory testing
payment_service = MockTestablePaymentService()
