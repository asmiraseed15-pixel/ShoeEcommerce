from django.urls import path

from .views import (
    SiteSettingsAPIView,
    HomePageSectionAPIView,
    AboutPageAPIView,
    ContactPageAPIView,
)

urlpatterns = [
    path("settings/", SiteSettingsAPIView.as_view(), name="site-settings"),
    path("home-sections/", HomePageSectionAPIView.as_view(), name="home-sections"),
    path("about/", AboutPageAPIView.as_view(), name="about-page"),
    path("contact/", ContactPageAPIView.as_view(), name="contact-page"),
]