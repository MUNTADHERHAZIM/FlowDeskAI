from rest_framework import serializers
from apps.notifications.models import Notification, Reminder


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "body", "read", "link", "created_at"]
        read_only_fields = ["id", "created_at"]


class ReminderSerializer(serializers.ModelSerializer):
    contact_name = serializers.CharField(source="contact.name", read_only=True)

    class Meta:
        model = Reminder
        fields = [
            "id",
            "appointment",
            "contact",
            "contact_name",
            "scheduled_for",
            "channel_type",
            "message_template",
            "sent",
            "sent_at",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
