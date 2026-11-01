
from django.conf import settings
from django.core.mail import send_mail

from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import CustomerMessage
from .serializers import CustomerMessageSerializer


class CustomerMessageCreateView(generics.CreateAPIView):
    queryset = CustomerMessage.objects.all()
    serializer_class = CustomerMessageSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):

        # Save customer message in database
        customer_message = serializer.save()

        # Email notification content
        subject = "New Customer Enquiry - StepUp"

        message = f"""
You have received a new enquiry from your StepUp website.

Customer Details:

Name: {customer_message.name}
Email: {customer_message.email}
Phone: {customer_message.phone}

Message:
{customer_message.message}

Please contact the customer if required.

StepUp Website
"""

        # Send notification to your Gmail
        recipient_email = getattr(
            settings,
            "CONTACT_RECEIVER_EMAIL",
            settings.EMAIL_HOST_USER
        )

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
