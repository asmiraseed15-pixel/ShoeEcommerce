
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile


class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    phone = serializers.CharField(
        write_only=True,
        max_length=10,
        required=False,
        allow_blank=True
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = ["id", "name", "email", "phone", "password"]

    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                "This email is already registered."
            )

        return email

    def create(self, validated_data):
        name = validated_data.pop("name")
        phone = validated_data.pop("phone", "")
        password = validated_data.pop("password")
        email = validated_data["email"]

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name
        )

        Profile.objects.create(
            user=user,
            phone=phone
        )

        return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "phone",
            "address",
            "city",
            "state",
            "postal_code",
        ]