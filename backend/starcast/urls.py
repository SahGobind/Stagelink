"""
URL configuration for StarCast backend.
"""
from django.urls import path, include
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import datetime

class HealthCheckView(APIView):
    """
    Health check endpoint at /api/health/
    Returns backend status, service health, and architecture metadata.
    """
    def get(self, request):
        return Response({
            "status": "healthy",
            "service": "StarCast International Casting Marketplace API",
            "version": "1.0.0-in-memory",
            "database_connected": False,
            "database_status": "disconnected_by_design (in-memory mode)",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "cors_configured": True,
            "modules": [
                "users",
                "companies",
                "casting_opportunities",
                "applications",
                "candidate_ranking",
                "messaging",
                "notifications",
                "payments_testable_interface"
            ]
        }, status=status.HTTP_200_OK)

urlpatterns = [
    # Health check endpoint
    path('api/health/', HealthCheckView.as_view(), name='api-health-check'),
    
    # Modular StarCast API routes
    path('api/users/', include('users.urls')),
    path('api/companies/', include('companies.urls')),
    path('api/opportunities/', include('opportunities.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/ranking/', include('ranking.urls')),
    path('api/messaging/', include('messaging.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/payments/', include('payments.urls')),
]
