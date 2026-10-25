from django.urls import path
from .views import CompanyListView, CompanyDetailView, CompanyReviewView

urlpatterns = [
    path('', CompanyListView.as_view(), name='company-list'),
    path('<str:pk>/', CompanyDetailView.as_view(), name='company-detail'),
    path('<str:pk>/reviews/', CompanyReviewView.as_view(), name='company-reviews'),
]

