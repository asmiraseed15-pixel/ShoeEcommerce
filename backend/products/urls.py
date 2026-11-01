


from django.urls import path

from .views import (
    CategoryListAPIView,
    ProductListAPIView,
    TrendingProductListAPIView,
    AdminProductListAPIView,
    ProductCreateAPIView,
    ProductUpdateAPIView,
    ProductDeleteAPIView,
)

urlpatterns = [
    # Public APIs
    path(
        "categories/",
        CategoryListAPIView.as_view(),
        name="category-list"
    ),

    path(
        "",
        ProductListAPIView.as_view(),
        name="product-list"
    ),

    # Public: Trending Products
    path(
        "trending/",
        TrendingProductListAPIView.as_view(),
        name="trending-products"
    ),

    # Admin APIs
    path(
        "admin/",
        AdminProductListAPIView.as_view(),
        name="admin-product-list"
    ),

    path(
        "create/",
        ProductCreateAPIView.as_view(),
        name="product-create"
    ),

    path(
        "<int:pk>/update/",
        ProductUpdateAPIView.as_view(),
        name="product-update"
    ),

    path(
        "<int:pk>/delete/",
        ProductDeleteAPIView.as_view(),
        name="product-delete"
    ),
]
