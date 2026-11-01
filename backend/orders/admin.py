

from django.contrib import admin
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    can_delete = False

    readonly_fields = (
        "product",
        "quantity",
        "size",
        "color",
        "price",
    )


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    can_delete = False

    fields = (
        "status",
        "note",
        "created_at",
    )

    readonly_fields = (
        "status",
        "note",
        "created_at",
    )

    ordering = ("created_at",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "full_name",
        "phone",
        "total_amount",
        "payment_method",
        "payment_status",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "payment_status",
        "payment_method",
        "created_at",
    )

    search_fields = (
        "full_name",
        "phone",
        "user__username",
        "user__email",
        "razorpay_order_id",
        "razorpay_payment_id",
    )

    readonly_fields = (
        "user",
        "total_amount",
        "razorpay_order_id",
        "razorpay_payment_id",
        "created_at",
        "updated_at",
    )

    inlines = [
        OrderItemInline,
        OrderStatusHistoryInline,
    ]

    ordering = ("-created_at",)

    list_per_page = 25
