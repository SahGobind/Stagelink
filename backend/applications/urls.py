from django.urls import path
from .views import (
    ApplicationListView,
    ApplicationDetailView,
    ApplicationWithdrawView,
    AuditionInviteView,
    TalentMyApplicationsView
)

urlpatterns = [
    path('', ApplicationListView.as_view(), name='application-list'),
    path('my/', TalentMyApplicationsView.as_view(), name='talent-my-applications'),
    path('<str:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
    path('<str:pk>/status/', ApplicationDetailView.as_view(), name='application-status-update'),
    path('<str:pk>/withdraw/', ApplicationWithdrawView.as_view(), name='application-withdraw'),
    path('<str:pk>/invite-audition/', AuditionInviteView.as_view(), name='application-invite-audition'),
]
