
from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):

    user_name = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = Review

        fields = [
            "id",
            "product",
            "user",
            "user_name",
            "rating",
            "title",
            "comment",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "user_name",
            "created_at",
            "updated_at",
        ]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5 stars."
            )
        return value

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Review title cannot be empty."
            )
        return value

    def validate_comment(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Review comment cannot be empty."
            )
        return value
