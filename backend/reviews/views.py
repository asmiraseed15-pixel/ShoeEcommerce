
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError

from .models import Review
from .serializers import ReviewSerializer


class ProductReviewListCreateView(generics.ListCreateAPIView):

    serializer_class = ReviewSerializer

    def get_queryset(self):
        product_id = self.request.query_params.get("product_id")

        if product_id:
            return Review.objects.filter(
                product_id=product_id
            ).select_related("user", "product")

        return Review.objects.all().select_related(
            "user", "product"
        )

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        product = serializer.validated_data["product"]

        existing_review = Review.objects.filter(
            product=product,
            user=self.request.user
        ).exists()

        if existing_review:
            raise ValidationError(
                "You have already reviewed this product."
            )

        serializer.save(user=self.request.user)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Review.objects.select_related("user", "product")
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        review = super().get_object()

        if review.user != self.request.user:
            raise permissions.PermissionDenied(
                "You can only edit or delete your own review."
            )

        return review
