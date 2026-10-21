"""
URL configuration for StageLink backend.
"""
from django.urls import path, include
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import datetime

from starcast.db import check_db_connection

class HealthCheckView(APIView):
    """
    Health check endpoint at /api/health/
    Verifies backend status, MongoDB Atlas connectivity, latency, and system metadata
    without exposing credentials.
    """
    def get(self, request):
        db_check = check_db_connection()
        db_connected = db_check.get("connected", False)

        return Response({
            "status": "healthy" if db_connected else "degraded" if db_check.get("status") == "unavailable" else "awaiting_configuration",
            "service": "StageLink International Casting Marketplace API",
            "version": "2.0.0-mongodb-atlas",
            "database_connected": db_connected,
            "database_engine": "MongoDB Atlas (PyMongo Direct)",
            "database_name": db_check.get("database"),
            "database_status": db_check.get("status"),
            "database_latency_ms": db_check.get("latency_ms"),
            "database_collections_count": len(db_check.get("collections", [])),
            "database_message": db_check.get("message"),
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "cors_configured": True,
            "modules": [
                "users_and_auth",
                "talent_profiles",
                "companies",
                "casting_opportunities",
                "applications",
                "candidate_ranking",
                "messaging",
                "notifications",
                "payments_and_publishing",
                "operation_team_support"
            ]
        }, status=status.HTTP_200_OK)


urlpatterns = [
    # Health check and root entry points
    path('', HealthCheckView.as_view(), name='api-root'),
    path('health/', HealthCheckView.as_view(), name='health-check-short'),
    path('api/health/', HealthCheckView.as_view(), name='api-health-check'),
    
    # Modular StarCast API routes (standard /api/ prefix)
    path('api/users/', include('users.urls')),
    path('api/companies/', include('companies.urls')),
    path('api/opportunities/', include('opportunities.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/ranking/', include('ranking.urls')),
    path('api/messaging/', include('messaging.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/support/', include('support.urls')),

    # Convenience direct routes (aliases without /api/ prefix)
    path('users/', include('users.urls')),
    path('companies/', include('companies.urls')),
    path('opportunities/', include('opportunities.urls')),
    path('applications/', include('applications.urls')),
    path('ranking/', include('ranking.urls')),
    path('messaging/', include('messaging.urls')),
    path('notifications/', include('notifications.urls')),
    path('payments/', include('payments.urls')),
    path('support/', include('support.urls')),
]
