from rest_framework import serializers
from .models import (
    SiteSettings,
    HomePageSection,
    AboutPage,
    ContactPage,
)


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = "__all__"


class HomePageSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomePageSection
        fields = "__all__"


class AboutPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutPage
        fields = "__all__"


class ContactPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactPage
        fields = "__all__"