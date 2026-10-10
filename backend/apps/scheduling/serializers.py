from rest_framework import serializers
from apps.scheduling.models import Service, Resource, Appointment


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "description", "duration_minutes", "price", "is_active"]
        read_only_fields = ["id"]


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ["id", "name", "resource_type", "capacity", "is_active"]
        read_only_fields = ["id"]


class AppointmentSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source="service.name", read_only=True)
    contact_name = serializers.CharField(source="contact.name", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "service",
            "service_name",
            "contact",
            "contact_name",
            "start_time",
            "end_time",
            "status",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
