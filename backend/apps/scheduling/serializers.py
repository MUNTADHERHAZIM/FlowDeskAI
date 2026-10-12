from rest_framework import serializers
from apps.scheduling.models import Service, Resource, Appointment, AppointmentResource


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            "id",
            "name",
            "description",
            "duration_minutes",
            "buffer_before",
            "buffer_after",
            "price",
            "is_active",
        ]
        read_only_fields = ["id"]


class ResourceSerializer(serializers.ModelSerializer):
    resource_type_display = serializers.CharField(source="get_resource_type_display", read_only=True)

    class Meta:
        model = Resource
        fields = ["id", "name", "resource_type", "resource_type_display", "capacity", "is_active"]
        read_only_fields = ["id"]


class AppointmentSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source="service.name", read_only=True)
    contact_name = serializers.CharField(source="contact.name", read_only=True)
    resource_ids = serializers.ListField(
        child=serializers.UUIDField(), required=False, write_only=True, default=list
    )
    resources = serializers.SerializerMethodField(read_only=True)

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
            "resource_ids",
            "resources",
            "created_at",
        ]
        read_only_fields = ["id", "end_time", "created_at"]

    def get_resources(self, obj):
        return [
            {
                "id": str(ar.resource.id),
                "name": ar.resource.name,
                "type": ar.resource.resource_type,
            }
            for ar in obj.appointment_resources.select_related("resource").all()
        ]


class CheckAvailabilitySerializer(serializers.Serializer):
    resource_ids = serializers.ListField(child=serializers.UUIDField(), min_length=1)
    start_time = serializers.DateTimeField()
    duration_minutes = serializers.IntegerField(default=30, min_value=5, max_value=480)
