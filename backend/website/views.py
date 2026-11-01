from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import (
    SiteSettings,
    HomePageSection,
    AboutPage,
    ContactPage,
)

from .serializers import (
    SiteSettingsSerializer,
    HomePageSectionSerializer,
    AboutPageSerializer,
    ContactPageSerializer,
)


class SiteSettingsAPIView(generics.ListAPIView):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    permission_classes = [AllowAny]


class HomePageSectionAPIView(generics.ListAPIView):
    queryset = HomePageSection.objects.filter(
        is_visible=True
    ).order_by("sort_order")
    serializer_class = HomePageSectionSerializer
    permission_classes = [AllowAny]


class AboutPageAPIView(generics.ListAPIView):
    queryset = AboutPage.objects.filter(is_published=True)
    serializer_class = AboutPageSerializer
    permission_classes = [AllowAny]


class ContactPageAPIView(generics.ListAPIView):
    queryset = ContactPage.objects.all()
    serializer_class = ContactPageSerializer
    permission_classes = [AllowAny]