from django.urls import path
from .views import (
    RankedCandidatesView,
    CandidateRecalculateScoreView,
    CandidateComparisonView,
    BulkShortlistView,
    ScoringCriteriaView
)

urlpatterns = [
    path('opportunities/<str:opp_id>/', RankedCandidatesView.as_view(), name='ranked-candidates'),
    path('applications/<str:app_id>/recalculate/', CandidateRecalculateScoreView.as_view(), name='recalculate-score'),
    path('compare/', CandidateComparisonView.as_view(), name='compare-candidates'),
    path('bulk-shortlist/', BulkShortlistView.as_view(), name='bulk-shortlist'),
    path('criteria/', ScoringCriteriaView.as_view(), name='scoring-criteria'),
]
