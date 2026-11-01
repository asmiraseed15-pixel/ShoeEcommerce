from rest_framework import serializers
from .models import CustomerMessage


class CustomerMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerMessage
        fields = ["id", "name", "email", "phone", "message", "created_at"]
        read_only_fields = ["id", "created_at"]