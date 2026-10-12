from rest_framework import serializers
from apps.channels.models import ChannelConnection, WebhookEvent, ChannelType


class ChannelConnectionSerializer(serializers.ModelSerializer):
    channel_type_display = serializers.CharField(source="get_channel_type_display", read_only=True)

    class Meta:
        model = ChannelConnection
        fields = [
            "id",
            "channel_type",
            "channel_type_display",
            "name",
            "is_active",
            "credentials",
            "webhook_secret",
            "settings",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "credentials": {"write_only": True},  # Don't leak sensitive tokens in GET requests
        }


class WebhookEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookEvent
        fields = [
            "id",
            "channel_connection",
            "event_type",
            "idempotency_key",
            "payload",
            "processed",
            "processed_at",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
