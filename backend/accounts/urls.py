
from django.urls import path
from .views import (
    RegisterAPIView,
    LoginAPIView,
    ProfileAPIView,
    GoogleLoginAPIView,
)

urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("profile/", ProfileAPIView.as_view(), name="profile"),
    path("google/", GoogleLoginAPIView.as_view(), name="google-login"),
]