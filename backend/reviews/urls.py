
from django.urls import path
from .views import (
    ProductReviewListCreateView,
    ReviewDetailView,
)

urlpatterns = [
    path(
        "",
        ProductReviewListCreateView.as_view(),
        name="product-review-list-create"
    ),

    path(
        "<int:pk>/",
        ReviewDetailView.as_view(),
        name="review-detail"
    ),
]
