from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.inbox.models import Conversation, Message
from apps.inbox.serializers import ConversationSerializer, MessageSerializer
from apps.tenants.permissions import IsTenantMember


class ConversationListView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return Conversation.objects.filter(tenant=self.request.tenant).select_related("contact")

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant)


class ConversationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return Conversation.objects.filter(tenant=self.request.tenant)


from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        conversation_id = self.kwargs.get("conversation_id")
        return Message.objects.filter(tenant=self.request.tenant, conversation_id=conversation_id)

    def perform_create(self, serializer):
        conversation = get_object_or_404(
            Conversation, id=self.kwargs.get("conversation_id"), tenant=self.request.tenant
        )
        msg = serializer.save(
            tenant=self.request.tenant,
            conversation=conversation,
            direction="outbound"
        )
        # Automatic Human Takeover: When an agent replies manually, pause the bot for 60 minutes
        conversation.last_message_at = timezone.now()
        conversation.is_bot_paused = True
        conversation.bot_paused_until = timezone.now() + timedelta(minutes=60)
        if self.request.user and self.request.user.is_authenticated:
            conversation.bot_paused_by = self.request.user
        conversation.save(update_fields=["last_message_at", "is_bot_paused", "bot_paused_until", "bot_paused_by"])


class ConversationToggleBotView(APIView):
    """
    Manually pause or resume AI auto-replies for a specific conversation.
    Supports setting custom pause duration or permanent pause.
    """
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def post(self, request, pk):
        conversation = get_object_or_404(Conversation, id=pk, tenant=request.tenant)
        should_pause = request.data.get("is_paused", not conversation.is_bot_paused)
        minutes = int(request.data.get("duration_minutes", 60))

        if should_pause:
            conversation.is_bot_paused = True
            conversation.bot_paused_until = timezone.now() + timedelta(minutes=minutes)
            conversation.bot_paused_by = request.user
            msg = f"تم إيقاف الرد الآلي مؤقتاً لمدة {minutes} دقيقة واستلام المحادثة بواسطة الموظف."
        else:
            conversation.is_bot_paused = False
            conversation.bot_paused_until = None
            conversation.bot_paused_by = None
            msg = "تمت إعادة تشغيل المساعد الذكي الآلي لهذه المحادثة."

        conversation.save(update_fields=["is_bot_paused", "bot_paused_until", "bot_paused_by"])
        return Response({
            "status": "success",
            "message": msg,
            "is_bot_paused": conversation.is_bot_paused,
            "bot_paused_until": conversation.bot_paused_until,
        }, status=status.HTTP_200_OK)
