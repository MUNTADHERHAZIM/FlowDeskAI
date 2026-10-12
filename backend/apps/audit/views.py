from rest_framework import generics, permissions
from apps.audit.models import AuditEvent
from apps.audit.serializers import AuditEventSerializer
from apps.tenants.permissions import IsTenantMember


class AuditEventListView(generics.ListAPIView):
    serializer_class = AuditEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        qs = AuditEvent.objects.filter(tenant=self.request.tenant).select_related("actor")
        action = self.request.query_params.get("action")
        resource_type = self.request.query_params.get("resource_type")
        if action:
            qs = qs.filter(action=action)
        if resource_type:
            qs = qs.filter(resource_type=resource_type)
        return qs
