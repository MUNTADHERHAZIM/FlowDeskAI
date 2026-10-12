from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.identity.views import (
    RegisterView,
    CustomTokenObtainPairView,
    CurrentUserView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("register", RegisterView.as_view(), name="auth-register-noslash"),
    path("login/", CustomTokenObtainPairView.as_view(), name="auth-login"),
    path("login", CustomTokenObtainPairView.as_view(), name="auth-login-noslash"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("refresh", TokenRefreshView.as_view(), name="auth-token-refresh-noslash"),
    path("me/", CurrentUserView.as_view(), name="auth-me"),
    path("me", CurrentUserView.as_view(), name="auth-me-noslash"),
]
