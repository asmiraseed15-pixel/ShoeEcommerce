

from decimal import Decimal

import razorpay

from django.conf import settings
from django.db import transaction
from django.db.models import F

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView

from products.models import Product
from .models import Order, OrderItem
from .serializers import OrderSerializer


# -----------------------------------------
# RAZORPAY CLIENT
# -----------------------------------------

def get_razorpay_client():

    key_id = getattr(settings, "RAZORPAY_KEY_ID", "")
    key_secret = getattr(settings, "RAZORPAY_KEY_SECRET", "")

    if not key_id or not key_secret:
        raise ValidationError({
            "payment": "Razorpay API keys are not configured. Check your .env file."
        })

    return razorpay.Client(
        auth=(key_id, key_secret)
    )


# -----------------------------------------
# ORDER LIST AND CREATE
# -----------------------------------------

class OrderListCreateView(generics.ListCreateAPIView):

    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related(
                "items",
                "items__product",
                "tracking_history",
            )
            .order_by("-created_at")
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):

        data = request.data
        items = data.get("items", [])

        if not isinstance(items, list) or not items:
            raise ValidationError({
                "items": "Cart is empty."
            })

        required_fields = [
            "full_name",
            "phone",
            "address",
            "city",
            "state",
            "postal_code",
            "payment_method",
        ]

        for field in required_fields:
            if not data.get(field):
                raise ValidationError({
                    field: f"{field} is required."
                })

        payment_method = data["payment_method"]

        if payment_method not in ["COD", "UPI", "CARD"]:
            raise ValidationError({
                "payment_method": "Invalid payment method."
            })

        total_amount = Decimal("0.00")
        order_items = []

        # ---------------------------------
        # VALIDATE PRODUCTS AND STOCK
        # ---------------------------------

        for item in items:

            try:
                product_id = int(item["product"])
                quantity = int(item["quantity"])
                size = str(item["size"]).strip()
                color = str(item["color"]).strip()

            except (KeyError, TypeError, ValueError):
                raise ValidationError({
                    "items": "Invalid product or item details."
                })

            if quantity <= 0 or not size or not color:
                raise ValidationError({
                    "items": "Quantity, size and color are required."
                })

            try:
                product = Product.objects.select_for_update().get(
                    id=product_id,
                    is_active=True
                )

            except Product.DoesNotExist:
                raise ValidationError({
                    "items": f"Product {product_id} is unavailable."
                })

            if product.stock < quantity:
                raise ValidationError({
                    "items": (
                        f"Only {product.stock} units available "
                        f"for {product.name}."
                    )
                })

            price = Decimal(str(product.price))

            total_amount += price * quantity

            order_items.append({
                "product": product,
                "quantity": quantity,
                "size": size,
                "color": color,
                "price": price,
            })

        # ---------------------------------
        # CREATE DATABASE ORDER
        # ---------------------------------

        order = Order.objects.create(
            user=request.user,
            full_name=data["full_name"],
            phone=data["phone"],
            address=data["address"],
            city=data["city"],
            state=data["state"],
            postal_code=data["postal_code"],
            payment_method=payment_method,
            total_amount=total_amount,
            payment_status="PENDING",
        )

        # Create order items and reserve stock
        for item in order_items:

            OrderItem.objects.create(
                order=order,
                **item
            )

            Product.objects.filter(
                id=item["product"].id
            ).update(
                stock=F("stock") - item["quantity"]
            )

        response_data = self.get_serializer(order).data

        # ---------------------------------
        # COD PAYMENT
        # ---------------------------------

        if payment_method == "COD":

            return Response(
                response_data,
                status=status.HTTP_201_CREATED
            )

        # ---------------------------------
        # UPI DEMO PAYMENT
        # ---------------------------------

        if payment_method == "UPI":

            order.payment_status = "PAID"
            order.status = "CONFIRMED"

            order.save(
                update_fields=[
                    "payment_status",
                    "status",
                    "updated_at"
                ]
            )

            response_data = self.get_serializer(order).data

            return Response(
                response_data,
                status=status.HTTP_201_CREATED
            )

        # ---------------------------------
        # RAZORPAY ORDER CREATION (CARD)
        # ---------------------------------

        if payment_method == "CARD":

            client = get_razorpay_client()

            try:

                razorpay_order = client.order.create(
                    data={
                        "amount": int(total_amount * 100),
                        "currency": "INR",
                        "receipt": f"shoe_order_{order.id}",
                    }
                )

                print(
                    "RAZORPAY ORDER CREATED:",
                    razorpay_order["id"]
                )

            except Exception as e:

                print("\n========== RAZORPAY ERROR ==========")
                print(repr(e))
                print("====================================\n")

                raise ValidationError({
                    "payment": (
                        "Unable to create Razorpay order. "
                        "Check backend terminal."
                    )
                })

            order.razorpay_order_id = razorpay_order["id"]

            order.save(
                update_fields=[
                    "razorpay_order_id",
                    "updated_at"
                ]
            )

            response_data = self.get_serializer(order).data

            response_data["razorpay_key_id"] = settings.RAZORPAY_KEY_ID
            response_data["razorpay_amount"] = int(total_amount * 100)
            response_data["razorpay_currency"] = "INR"

            return Response(
                response_data,
                status=status.HTTP_201_CREATED
            )


# -----------------------------------------
# VERIFY RAZORPAY PAYMENT
# -----------------------------------------

class VerifyPaymentView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        razorpay_order_id = request.data.get(
            "razorpay_order_id"
        )

        razorpay_payment_id = request.data.get(
            "razorpay_payment_id"
        )

        razorpay_signature = request.data.get(
            "razorpay_signature"
        )

        if not all([
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        ]):

            raise ValidationError({
                "payment": "Payment verification details are required."
            })

        # Find the logged-in user's order
        try:

            order = Order.objects.select_for_update().get(
                razorpay_order_id=razorpay_order_id,
                user=request.user
            )

        except Order.DoesNotExist:

            raise ValidationError({
                "order": "Order not found."
            })

        # Prevent duplicate verification
        if order.payment_status == "PAID":

            if order.razorpay_payment_id == razorpay_payment_id:

                return Response({
                    "message": "Payment already verified.",
                    "payment_status": "PAID",
                    "order_id": order.id,
                    "order_status": order.status,
                })

            raise ValidationError({
                "payment": "This order has already been paid."
            })

        client = get_razorpay_client()

        # ---------------------------------
        # VERIFY PAYMENT SIGNATURE
        # ---------------------------------

        try:

            client.utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            })

        except Exception as e:

            print("RAZORPAY SIGNATURE ERROR:", repr(e))

            raise ValidationError({
                "payment": "Invalid payment signature."
            })

        # ---------------------------------
        # FETCH PAYMENT DETAILS
        # ---------------------------------

        try:

            payment = client.payment.fetch(
                razorpay_payment_id
            )

            if payment.get("order_id") != order.razorpay_order_id:

                raise ValidationError({
                    "payment": "Payment does not belong to this order."
                })

            expected_amount = int(
                order.total_amount * 100
            )

            if (
                int(payment.get("amount", 0)) != expected_amount
                or payment.get("currency") != "INR"
            ):

                raise ValidationError({
                    "payment": "Payment amount or currency mismatch."
                })

            # Capture authorized payment
            if payment.get("status") == "authorized":

                client.payment.capture(
                    razorpay_payment_id,
                    expected_amount
                )

                payment = client.payment.fetch(
                    razorpay_payment_id
                )

            if payment.get("status") != "captured":

                raise ValidationError({
                    "payment": "Payment is not captured yet."
                })

        except ValidationError:
            raise

        except Exception as e:

            print("RAZORPAY PAYMENT VERIFY ERROR:", repr(e))

            raise ValidationError({
                "payment": "Unable to verify payment with Razorpay."
            })

        # ---------------------------------
        # UPDATE SUCCESSFUL PAYMENT
        # ---------------------------------

        order.razorpay_payment_id = razorpay_payment_id
        order.payment_status = "PAID"
        order.status = "CONFIRMED"

        order.save(
            update_fields=[
                "razorpay_payment_id",
                "payment_status",
                "status",
                "updated_at"
            ]
        )

        return Response({
            "message": "Payment successful. Order confirmed.",
            "payment_status": order.payment_status,
            "order_status": order.status,
            "order_id": order.id,
        }, status=status.HTTP_200_OK)
