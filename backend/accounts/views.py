


from django.conf import settings
from django.contrib.auth.models import User

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import Profile
from .serializers import RegisterSerializer, ProfileSerializer


# REGISTER API
class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            {
                "message": "Registration successful!",
                "user": {
                    "id": user.id,
                    "name": user.first_name,
                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                },
            },
            status=status.HTTP_201_CREATED,
        )


# LOGIN API
class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        users = User.objects.filter(
            email__iexact=email,
            is_active=True
        )

        user = None

        for account in users:
            if account.check_password(password):
                user = account
                break

        if user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful!",
                "user": {
                    "id": user.id,
                    "name": user.first_name,
                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )


# PROFILE API
class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, created = Profile.objects.get_or_create(
            user=request.user
        )

        return Response({
            "id": request.user.id,
            "name": request.user.first_name,
            "email": request.user.email,
            "phone": profile.phone,
            "address": profile.address,
            "city": profile.city,
            "state": profile.state,
            "postal_code": profile.postal_code,
        })

    def patch(self, request):
        user = request.user

        profile, created = Profile.objects.get_or_create(
            user=user
        )

        name = request.data.get("name")
        email = request.data.get("email")

        if name is not None:
            user.first_name = name.strip()

        if email is not None:
            email = email.strip().lower()

            if not email:
                return Response(
                    {"error": "Email cannot be empty."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if User.objects.filter(
                email__iexact=email
            ).exclude(id=user.id).exists():
                return Response(
                    {"error": "Email already registered."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.email = email
            user.username = email

        user.save()

        serializer = ProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "message": "Profile updated successfully!",
            "id": user.id,
            "name": user.first_name,
            "email": user.email,
            **serializer.data,
        })


# GOOGLE LOGIN API
class GoogleLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        credential = request.data.get("credential")

        if not credential:
            return Response(
                {"error": "Google credential is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Verify Google ID token
            google_user = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )

            email = google_user.get("email", "").strip().lower()
            email_verified = google_user.get("email_verified", False)
            name = google_user.get("name", "")

            if not email or not email_verified:
                return Response(
                    {"error": "Google email is not verified."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Find existing user
            user = User.objects.filter(
                email__iexact=email
            ).first()

            # Create new user if not found
            if user is None:
                username = email

                if User.objects.filter(username=username).exists():
                    username = f"google_{google_user.get('sub')}"

                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=name,
                )

            if not user.is_active:
                return Response(
                    {"error": "This account is inactive."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "Google login successful!",
                    "user": {
                        "id": user.id,
                        "name": user.first_name,
                        "username": user.username,
                        "email": user.email,
                        "is_staff": user.is_staff,
                        "is_superuser": user.is_superuser,
                    },
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                status=status.HTTP_200_OK,
            )

        except ValueError:
            return Response(
                {"error": "Invalid Google token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
