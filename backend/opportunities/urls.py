from django.urls import path
from .views import OpportunityListView, OpportunityDetailView, RecruiterOpportunitiesView

urlpatterns = [
    path('', OpportunityListView.as_view(), name='opportunity-list'),
    path('recruiter/', RecruiterOpportunitiesView.as_view(), name='recruiter-opportunities'),
    path('<str:pk>/', OpportunityDetailView.as_view(), name='opportunity-detail'),
]
