from django.urls import path
from .views import (
    OpportunityListView,
    OpportunityDetailView,
    RecruiterOpportunitiesView,
    CreateOrderView,
    ConfirmPaymentView,
)

urlpatterns = [
    path('', OpportunityListView.as_view(), name='opportunity-list'),
    path('recruiter/', RecruiterOpportunitiesView.as_view(), name='recruiter-opportunities'),
    path('create-order', CreateOrderView.as_view(), name='opportunity-create-order-no-slash'),
    path('create-order/', CreateOrderView.as_view(), name='opportunity-create-order'),
    path('confirm-payment', ConfirmPaymentView.as_view(), name='opportunity-confirm-payment-no-slash'),
    path('confirm-payment/', ConfirmPaymentView.as_view(), name='opportunity-confirm-payment'),
    path('<str:pk>/', OpportunityDetailView.as_view(), name='opportunity-detail'),
]
