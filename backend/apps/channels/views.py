import uuid
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from apps.channels.models import ChannelConnection, WebhookEvent
from apps.channels.serializers import ChannelConnectionSerializer, WebhookEventSerializer
from apps.tenants.permissions import IsTenantMember
from apps.tenants.models import Tenant


class ChannelConnectionListCreateView(generics.ListCreateAPIView):
    serializer_class = ChannelConnectionSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return ChannelConnection.objects.filter(tenant=self.request.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant)


class ChannelConnectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ChannelConnectionSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return ChannelConnection.objects.filter(tenant=self.request.tenant)


from django.http import HttpResponse
from apps.contacts.models import Contact
from apps.inbox.models import Conversation, Message, MessageDirection, MessageType
from apps.ai.services import transcribe_voice_note, generate_omnichannel_response


class InboundWebhookReceiverView(APIView):
    """
    Official Webhook Receiver for all supported channels:
    - WhatsApp Cloud API (Meta)
    - Instagram Direct Messages (Meta)
    - Facebook Messenger (Meta)
    - Telegram Bot API
    - WebChat & Custom Webhooks

    Supports:
    1. Meta GET verification challenge (hub.mode, hub.verify_token, hub.challenge).
    2. Voice Notes transcription (Audio -> Whisper -> Text).
    3. Human Agent Takeover checking (conversation.is_bot_active()).
    4. Omnichannel AI response & conversation synchronization.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, channel_id):
        """
        Meta Graph API (WhatsApp, Instagram, Messenger) Webhook Verification Challenge.
        """
        channel = get_object_or_404(ChannelConnection, id=channel_id, is_active=True)
        hub_mode = request.query_params.get("hub.mode")
        hub_token = request.query_params.get("hub.verify_token")
        hub_challenge = request.query_params.get("hub.challenge")

        if hub_mode == "subscribe":
            expected_token = channel.webhook_secret or channel.credentials.get("verify_token") or "flowdesk_webhook_token"
            if hub_token == expected_token or not channel.webhook_secret:
                return HttpResponse(hub_challenge, content_type="text/plain", status=200)
            return Response({"error": "Invalid verification token"}, status=status.HTTP_403_FORBIDDEN)

        return Response(
            {"status": "active", "channel": channel.name, "type": channel.channel_type},
            status=status.HTTP_200_OK,
        )

    def post(self, request, channel_id):
        channel = get_object_or_404(ChannelConnection, id=channel_id, is_active=True)
        payload = request.data or {}

        # 1. Idempotency Key Validation
        idempotency_key = request.headers.get(
            "X-Idempotency-Key",
            str(payload.get("id", payload.get("message_id", uuid.uuid4())))
        )

        event, created = WebhookEvent.objects.get_or_create(
            tenant=channel.tenant,
            idempotency_key=str(idempotency_key),
            defaults={
                "channel_connection": channel,
                "event_type": payload.get("event", "message.received"),
                "payload": payload,
                "processed": True,
                "processed_at": timezone.now(),
            },
        )

        if not created:
            return Response(
                {"status": "already_processed", "idempotency_key": idempotency_key},
                status=status.HTTP_200_OK,
            )

        # 2. Extract sender, message text, and media type across platform formats
        extracted = self._extract_payload(channel.channel_type, payload)
        sender_id = extracted.get("sender_id", "guest_user")
        sender_name = extracted.get("sender_name", "مستخدم المنصة")
        raw_text = extracted.get("text", "")
        is_audio = extracted.get("is_audio", False)
        audio_url = extracted.get("audio_url", "")

        # 3. Voice Note Transcription
        transcription_info = None
        if is_audio:
            transcription_info = transcribe_voice_note(audio_url=audio_url)
            transcription_text = transcription_info.get("text", "")
            raw_text = f"[🎙️ تسجيل صوتي مفرغ]: {transcription_text}"

        # 4. Find or Create Contact & Conversation in Inbox
        contact, _ = Contact.objects.get_or_create(
            tenant=channel.tenant,
            phone_number=sender_id if sender_id.startswith("+") or sender_id.isdigit() else "",
            defaults={"name": sender_name},
        )

        conversation, _ = Conversation.objects.get_or_create(
            tenant=channel.tenant,
            contact=contact,
            channel_connection=channel,
            defaults={"status": "open"},
        )

        # Save Inbound Message
        inbound_msg = Message.objects.create(
            tenant=channel.tenant,
            conversation=conversation,
            channel_connection=channel,
            direction=MessageDirection.INBOUND,
            message_type=MessageType.AUDIO if is_audio else MessageType.TEXT,
            text_content=raw_text or "مرحباً",
            provider_message_id=str(idempotency_key),
            metadata={"extracted": extracted, "transcription": transcription_info},
        )
        conversation.last_message_at = timezone.now()
        conversation.save(update_fields=["last_message_at"])

        # 5. Human Agent Takeover Check
        bot_active = conversation.is_bot_active()
        ai_response_text = None

        if bot_active:
            # Generate Omnichannel AI Response
            ai_res = generate_omnichannel_response(
                incoming_text=raw_text,
                tenant=channel.tenant,
                origin_channel=channel.get_channel_type_display(),
                sender_name=contact.name or "العميل الكريم",
            )
            ai_response_text = ai_res.get("reply", "")

            # Save Outbound AI Reply
            Message.objects.create(
                tenant=channel.tenant,
                conversation=conversation,
                channel_connection=channel,
                direction=MessageDirection.OUTBOUND,
                message_type=MessageType.TEXT,
                text_content=ai_response_text,
                metadata={"ai_generated": True, "model": ai_res.get("model")},
            )
        else:
            ai_response_text = "[Human Takeover Active]: الرد الآلي معلق مؤقتاً لأن الموظف استلم المحادثة."

        return Response(
            {
                "status": "processed",
                "event_id": str(event.id),
                "channel": channel.channel_type,
                "is_voice_note": is_audio,
                "human_takeover_active": not bot_active,
                "bot_replied": bot_active,
                "reply": ai_response_text,
                "reply_sample": ai_response_text[:80] if ai_response_text else None,
            },
            status=status.HTTP_201_CREATED,
        )

    def _extract_payload(self, channel_type: str, payload: dict) -> dict:
        """
        Extracts sender information, text content, and audio attachments
        from WhatsApp, Instagram, Telegram, and standard Webhooks.
        """
        # Meta: WhatsApp Cloud API
        if channel_type == "whatsapp":
            try:
                msg = payload["entry"][0]["changes"][0]["value"]["messages"][0]
                sender = msg.get("from", "")
                if msg.get("type") == "audio":
                    return {"sender_id": sender, "sender_name": f"واتساب ({sender})", "is_audio": True, "audio_url": msg.get("audio", {}).get("id", "")}
                text = msg.get("text", {}).get("body", "")
                return {"sender_id": sender, "sender_name": f"واتساب ({sender})", "text": text, "is_audio": False}
            except Exception:
                pass

        # Meta: Instagram DM / Facebook Messenger
        if channel_type in ["instagram", "messenger"]:
            try:
                messaging = payload["entry"][0]["messaging"][0]
                sender = messaging.get("sender", {}).get("id", "")
                msg = messaging.get("message", {})
                attachments = msg.get("attachments", [])
                if attachments and attachments[0].get("type") == "audio":
                    return {"sender_id": sender, "sender_name": f"إنستغرام ({sender[:6]})", "is_audio": True, "audio_url": attachments[0].get("payload", {}).get("url", "")}
                text = msg.get("text", "")
                return {"sender_id": sender, "sender_name": f"إنستغرام ({sender[:6]})", "text": text, "is_audio": False}
            except Exception:
                pass

        # Telegram Bot API
        if channel_type == "telegram":
            try:
                tg_msg = payload.get("message", payload.get("edited_message", {}))
                sender = str(tg_msg.get("from", {}).get("id", ""))
                first_name = tg_msg.get("from", {}).get("first_name", "مستخدم تيليجرام")
                if "voice" in tg_msg or "audio" in tg_msg:
                    voice_obj = tg_msg.get("voice", tg_msg.get("audio", {}))
                    return {"sender_id": sender, "sender_name": first_name, "is_audio": True, "audio_url": voice_obj.get("file_id", "")}
                text = tg_msg.get("text", "")
                return {"sender_id": sender, "sender_name": first_name, "text": text, "is_audio": False}
            except Exception:
                pass

        # Generic WebChat / Fallback
        return {
            "sender_id": str(payload.get("sender_id", payload.get("sender", "guest"))),
            "sender_name": payload.get("sender_name", payload.get("name", "زائر الموقع")),
            "text": payload.get("text", payload.get("message", payload.get("body", ""))),
            "is_audio": payload.get("is_audio", False),
            "audio_url": payload.get("audio_url", ""),
        }


class PublicWebChatWebhookView(APIView):
    """
    Public lightweight endpoint for Web Chat Widget & Direct Customer Links (/chat).
    Does not require third-party verification, Meta credentials, or complicated setups.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        tenant_identifier = (
            request.headers.get("X-Tenant-ID")
            or request.data.get("tenant")
            or request.query_params.get("tenant")
            or "baghdad-lab"
        )

        tenant = None
        try:
            tenant = Tenant.objects.filter(id=uuid.UUID(str(tenant_identifier))).first()
        except (ValueError, TypeError):
            pass

        if not tenant:
            tenant = Tenant.objects.filter(slug=tenant_identifier).first()
        if not tenant:
            tenant = Tenant.objects.first()
            if not tenant:
                tenant = Tenant.objects.create(name="العيادة المتقدمة", slug="baghdad-lab")

        channel, _ = ChannelConnection.objects.get_or_create(
            tenant=tenant,
            channel_type="webchat",
            defaults={"name": "ودجت محادثة الموقع الحي", "is_active": True},
        )

        return InboundWebhookReceiverView().post(request, channel_id=channel.id)

