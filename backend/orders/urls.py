
from django.urls import path

from .views import (
    OrderListCreateView,
    VerifyPaymentView,
)

urlpatterns = [
    # Create and list orders
    path(
        "",
        OrderListCreateView.as_view(),
        name="order-list-create"
    ),

    # Verify Razorpay payment
    path(
        "verify-payment/",
        VerifyPaymentView.as_view(),
        name="verify-payment"
    ),
]
