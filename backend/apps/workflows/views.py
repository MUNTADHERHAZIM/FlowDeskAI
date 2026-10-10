from rest_framework import generics, permissions
from apps.workflows.models import Workflow, WorkflowVersion
from apps.workflows.serializers import WorkflowSerializer, WorkflowVersionSerializer
from apps.tenants.permissions import IsTenantMember


class WorkflowListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkflowSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return Workflow.objects.filter(tenant=self.request.tenant)

    def perform_create(self, serializer):
        workflow = serializer.save(tenant=self.request.tenant)
        # Create initial draft version
        WorkflowVersion.objects.create(
            tenant=self.request.tenant,
            workflow=workflow,
            version_number=1,
            is_published=False,
            definition={"nodes": [], "edges": []}
        )


class WorkflowDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkflowSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return Workflow.objects.filter(tenant=self.request.tenant)
