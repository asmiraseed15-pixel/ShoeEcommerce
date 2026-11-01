

from django.conf import settings
from django.db import models
from products.models import Product


class Order(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("CONFIRMED", "Confirmed"),
        ("PROCESSING", "Processing"),
        ("SHIPPED", "Shipped"),
        ("OUT_FOR_DELIVERY", "Out for Delivery"),
        ("DELIVERED", "Delivered"),
        ("CANCELLED", "Cancelled"),
    ]

    PAYMENT_CHOICES = [
        ("COD", "Cash on Delivery"),
        ("UPI", "UPI"),
        ("CARD", "Card"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
        ("FAILED", "Failed"),
        ("REFUNDED", "Refunded"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="shoe_orders"
    )

    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)

    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_CHOICES
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    # Order Status
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    # Razorpay Payment Details
    razorpay_order_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    razorpay_payment_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="PENDING"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):

        is_new = self.pk is None

        if not is_new:
            old_status = (
                Order.objects
                .filter(pk=self.pk)
                .values_list("status", flat=True)
                .first()
            )
        else:
            old_status = None

        super().save(*args, **kwargs)

        if is_new:
            OrderStatusHistory.objects.create(
                order=self,
                status=self.status,
                note="Order placed"
            )

        elif old_status != self.status:
            OrderStatusHistory.objects.create(
                order=self,
                status=self.status,
                note=f"Order status changed to {self.get_status_display()}"
            )

    def __str__(self):
        return f"Order #{self.id} - {self.user}"


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT
    )

    quantity = models.PositiveIntegerField()
    size = models.CharField(max_length=10)
    color = models.CharField(max_length=50)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


class OrderStatusHistory(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="tracking_history"
    )

    status = models.CharField(
        max_length=30,
        choices=Order.STATUS_CHOICES
    )

    note = models.CharField(
        max_length=255,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Order #{self.order.id} - {self.status}"
