
from django.contrib import admin
from .models import (
    SiteSettings,
    HomePageSection,
    AboutPage,
    ContactPage,
)


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ("site_name", "primary_color", "font_family")


@admin.register(HomePageSection)
class HomePageSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "section_type", "sort_order", "is_visible")
    list_editable = ("sort_order", "is_visible")
    list_filter = ("section_type", "is_visible")
    ordering = ("sort_order",)


@admin.register(AboutPage)
class AboutPageAdmin(admin.ModelAdmin):
    list_display = ("title", "is_published")


@admin.register(ContactPage)
class ContactPageAdmin(admin.ModelAdmin):
    list_display = ("title", "email", "phone")