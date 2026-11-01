

from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(
        source="get_status_display",
        read_only=True
    )

    class Meta:
        model = OrderStatusHistory
        fields = [
            "id",
            "status",
            "status_label",
            "note",
            "created_at",
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    product_image = serializers.SerializerMethodField()

    def get_product_image(self, obj):
        product = obj.product

        if product.image:
            image_url = product.image.url
            request = self.context.get("request")

            if request:
                return request.build_absolute_uri(image_url)

            return image_url

        return product.image_url or ""

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_image",
            "quantity",
            "size",
            "color",
            "price",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    tracking_history = OrderStatusHistorySerializer(
        many=True,
        read_only=True
    )

    status_label = serializers.CharField(
        source="get_status_display",
        read_only=True
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "full_name",
            "phone",
            "address",
            "city",
            "state",
            "postal_code",
            "payment_method",
            "total_amount",
            "status",
            "status_label",
            "payment_status",
            "razorpay_order_id",
            "razorpay_payment_id",
            "items",
            "tracking_history",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "total_amount",
            "status",
            "payment_status",
            "razorpay_order_id",
            "razorpay_payment_id",
            "created_at",
            "updated_at",
        ]
