from rest_framework import serializers
from apps.audit.models import AuditEvent


class AuditEventSerializer(serializers.ModelSerializer):
    actor_email = serializers.CharField(source="actor.email", read_only=True)
    actor_name = serializers.CharField(source="actor.get_full_name", read_only=True)

    class Meta:
        model = AuditEvent
        fields = [
            "id",
            "actor",
            "actor_email",
            "actor_name",
            "action",
            "resource_type",
            "resource_id",
            "ip_address",
            "changes",
            "timestamp",
        ]
        read_only_fields = ["id", "timestamp"]
