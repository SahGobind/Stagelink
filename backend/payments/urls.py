from django.urls import path
from .views import CreatePaymentIntentView, ConfirmPaymentView, PaymentStatusView

urlpatterns = [
    path('create-intent/', CreatePaymentIntentView.as_view(), name='payment-create-intent'),
    path('confirm/', ConfirmPaymentView.as_view(), name='payment-confirm'),
    path('status/<str:intent_id>/', PaymentStatusView.as_view(), name='payment-status'),
]
