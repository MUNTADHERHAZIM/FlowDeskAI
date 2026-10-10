from rest_framework import serializers
from apps.inbox.models import Conversation, Message, Ticket
from apps.contacts.models import Contact


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "direction",
            "message_type",
            "text_content",
            "delivery_status",
            "sent_at",
            "delivered_at",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    contact_name = serializers.CharField(source="contact.name", read_only=True)
    contact_phone = serializers.CharField(source="contact.phone_number", read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "contact",
            "contact_name",
            "contact_phone",
            "channel_connection",
            "status",
            "assigned_to",
            "last_message_at",
            "created_at",
            "last_message",
        ]
        read_only_fields = ["id", "last_message_at", "created_at"]

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        if msg:
            return {
                "text": msg.text_content,
                "direction": msg.direction,
                "created_at": msg.created_at,
            }
        return None
