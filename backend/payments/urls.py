from django.urls import path
from .views import (
    CreatePaymentIntentView,
    ConfirmPaymentView,
    PaymentStatusView,
    VerifyPaymentView,
    PaymentListView,
    PaymentRefundView,
)

urlpatterns = [
    path('', PaymentListView.as_view(), name='payment-list'),
    path('<str:payment_id>/refund/', PaymentRefundView.as_view(), name='payment-refund'),
    path('create-intent/', CreatePaymentIntentView.as_view(), name='payment-create-intent'),
    path('confirm/', ConfirmPaymentView.as_view(), name='payment-confirm'),
    path('verify/', VerifyPaymentView.as_view(), name='payment-verify'),
    path('status/<str:intent_id>/', PaymentStatusView.as_view(), name='payment-status'),
]
