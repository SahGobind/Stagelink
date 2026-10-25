from django.urls import path
from .views import (
    ApplicationListView,
    ApplicationDetailView,
    ApplicationWithdrawView,
    AuditionInviteView,
    TalentMyApplicationsView,
    ApplicationFeedbackView,
    CandidateReviewsView,
)

urlpatterns = [
    path('', ApplicationListView.as_view(), name='application-list'),
    path('my/', TalentMyApplicationsView.as_view(), name='talent-my-applications'),
    path('<str:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
    path('<str:pk>/status/', ApplicationDetailView.as_view(), name='application-status-update'),
    path('<str:pk>/withdraw/', ApplicationWithdrawView.as_view(), name='application-withdraw'),
    path('<str:pk>/invite-audition/', AuditionInviteView.as_view(), name='application-invite-audition'),
    path('<str:pk>/feedback/', ApplicationFeedbackView.as_view(), name='application-feedback'),
    path('candidate-reviews/<str:candidate_id>/', CandidateReviewsView.as_view(), name='candidate-reviews'),
]

