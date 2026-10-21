"""
URL patterns for StageLink Help & Support System.
"""
from django.urls import path
from .views import (
    SupportTicketListCreateView,
    SupportTicketDetailView,
    SupportTicketReplyView,
    SupportTicketInternalNoteView,
    SupportTicketReopenView,
    SupportMetricsView,
    SupportHealthView,
)

urlpatterns = [
    path('tickets/', SupportTicketListCreateView.as_view(), name='support-tickets-list-create'),
    path('tickets/<str:ticket_id>/', SupportTicketDetailView.as_view(), name='support-ticket-detail'),
    path('tickets/<str:ticket_id>/reply/', SupportTicketReplyView.as_view(), name='support-ticket-reply'),
    path('tickets/<str:ticket_id>/note/', SupportTicketInternalNoteView.as_view(), name='support-ticket-note'),
    path('tickets/<str:ticket_id>/reopen/', SupportTicketReopenView.as_view(), name='support-ticket-reopen'),
    path('metrics/', SupportMetricsView.as_view(), name='support-metrics'),
    path('health/', SupportHealthView.as_view(), name='support-health'),
]
