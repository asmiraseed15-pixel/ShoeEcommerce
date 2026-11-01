from django.urls import path
from .views import CustomerMessageCreateView

urlpatterns = [
    path("", CustomerMessageCreateView.as_view(), name="customer-message-create"),
]