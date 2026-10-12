from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from apps.notifications.models import Notification, Reminder
from apps.notifications.serializers import NotificationSerializer, ReminderSerializer
from apps.tenants.permissions import IsTenantMember


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return Notification.objects.filter(
            tenant=self.request.tenant, recipient=self.request.user
        ).order_by("-created_at")


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def post(self, request, pk=None):
        if pk:
            notif = get_object_or_404(
                Notification, id=pk, tenant=request.tenant, recipient=request.user
            )
            notif.read = True
            notif.save(update_fields=["read"])
            return Response({"status": "marked_read", "id": str(notif.id)})
        else:
            # Mark all as read
            Notification.objects.filter(
                tenant=request.tenant, recipient=request.user, read=False
            ).update(read=True)
            return Response({"status": "all_marked_read"})


class ReminderListCreateView(generics.ListCreateAPIView):
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return Reminder.objects.filter(tenant=self.request.tenant).select_related("contact", "appointment")

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant)
