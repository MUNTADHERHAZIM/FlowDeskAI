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
        conversation.save(update_fields=["last_message_at"])
