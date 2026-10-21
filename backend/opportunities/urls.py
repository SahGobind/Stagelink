from django.urls import path
from .views import (
    OpportunityListView,
    OpportunityDetailView,
    RecruiterOpportunitiesView,
    CreateOrderView,
    ConfirmPaymentView,
    OpportunityModerationListView,
    OpportunityApproveView,
    OpportunityRejectView,
    PricingConfigView,
    OpportunityValidateView,
    RecruiterDashboardDataView,
)

urlpatterns = [
    path('', OpportunityListView.as_view(), name='opportunity-list'),
    path('pricing/', PricingConfigView.as_view(), name='opportunity-pricing'),
    path('validate/', OpportunityValidateView.as_view(), name='opportunity-validate'),
    path('recruiter/', RecruiterOpportunitiesView.as_view(), name='recruiter-opportunities'),
    path('recruiter/dashboard/', RecruiterDashboardDataView.as_view(), name='recruiter-dashboard-data'),
    path('create-order', CreateOrderView.as_view(), name='opportunity-create-order-no-slash'),
    path('create-order/', CreateOrderView.as_view(), name='opportunity-create-order'),
    path('confirm-payment', ConfirmPaymentView.as_view(), name='opportunity-confirm-payment-no-slash'),
    path('confirm-payment/', ConfirmPaymentView.as_view(), name='opportunity-confirm-payment'),
    path('moderation/', OpportunityModerationListView.as_view(), name='opportunity-moderation-list'),
    path('<str:pk>/approve/', OpportunityApproveView.as_view(), name='opportunity-approve'),
    path('<str:pk>/reject/', OpportunityRejectView.as_view(), name='opportunity-reject'),
    path('<str:pk>/', OpportunityDetailView.as_view(), name='opportunity-detail'),
]
