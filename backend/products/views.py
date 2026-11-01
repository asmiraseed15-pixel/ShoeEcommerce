

from rest_framework import generics
from rest_framework.permissions import IsAdminUser

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


# Public: View Categories
class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


# Public: View Active Products
class ProductListAPIView(generics.ListAPIView):
    queryset = Product.objects.filter(
        is_active=True
    ).select_related("category")
    serializer_class = ProductSerializer


# Public: View Trending Products
class TrendingProductListAPIView(generics.ListAPIView):
    queryset = Product.objects.filter(
        is_active=True,
        is_trending=True
    ).select_related("category")
    serializer_class = ProductSerializer


# Admin: View ALL Products
class AdminProductListAPIView(generics.ListAPIView):
    queryset = Product.objects.all().select_related("category")
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]


# Admin: Add Product
class ProductCreateAPIView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]


# Admin: Edit Product
class ProductUpdateAPIView(generics.UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]


# Admin: Delete Product
class ProductDeleteAPIView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
