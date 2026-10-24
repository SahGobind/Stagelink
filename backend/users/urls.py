from django.urls import path
from .views import (
    UserListView,
    UserRegisterView,
    UserLoginView,
    UserProfileView,
    UserProfilePublishView,
    UserProfileUnpublishView,
    RecruiterRegisterView,
    RecruiterLoginView,
    RecruiterProfileView,
)

urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/publish/', UserProfilePublishView.as_view(), name='user-profile-publish'),
    path('profile/unpublish/', UserProfileUnpublishView.as_view(), name='user-profile-unpublish'),
    path('recruiter/register/', RecruiterRegisterView.as_view(), name='recruiter-register'),
    path('recruiter/login/', RecruiterLoginView.as_view(), name='recruiter-login'),
    path('recruiter/profile/', RecruiterProfileView.as_view(), name='recruiter-profile'),
]

