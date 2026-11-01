
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    original_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    stock = models.PositiveIntegerField(default=0)

    # Product images
    image_url = models.URLField(blank=True)
    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True,
    )

    # Ratings
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=0,
    )
    review_count = models.PositiveIntegerField(default=0)

    # Product details
    style = models.CharField(max_length=100, blank=True)
    brand = models.CharField(max_length=100, blank=True)

    colors = models.JSONField(default=list, blank=True)
    sizes = models.JSONField(default=list, blank=True)
    specifications = models.JSONField(default=list, blank=True)

    is_active = models.BooleanField(default=True)
    is_trending = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
