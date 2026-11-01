

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/products/", include("products.urls")),
    path("api/auth/", include("accounts.urls")),
    path("api/website/", include("website.urls")),
    path("api/reviews/", include("reviews.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/customer-messages/", include("customer_messages.urls")),

    # Serve product images
    re_path(
        r"^media/(?P<path>.*)$",
        serve,
        {"document_root": settings.MEDIA_ROOT},
    ),
]
