from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "product",
        "user",
        "rating",
        "title",
        "created_at",
    )

    list_filter = ("rating", "created_at")
    search_fields = (
        "title",
        "comment",
        "user__username",
        "product__name",
    )