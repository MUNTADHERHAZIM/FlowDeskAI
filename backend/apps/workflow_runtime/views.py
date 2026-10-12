from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from apps.workflow_runtime.models import WorkflowRun, NodeExecution, RunStatus
from apps.workflow_runtime.serializers import (
    WorkflowRunSerializer,
    NodeExecutionSerializer,
    TriggerWorkflowRunSerializer,
)
from apps.workflows.models import WorkflowVersion
from apps.tenants.permissions import IsTenantMember


class WorkflowRunListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TriggerWorkflowRunSerializer
        return WorkflowRunSerializer

    def get_queryset(self):
        qs = WorkflowRun.objects.filter(tenant=self.request.tenant).select_related(
            "workflow_version__workflow"
        ).prefetch_related("node_executions")
        workflow_id = self.request.query_params.get("workflow_id")
        if workflow_id:
            qs = qs.filter(workflow_version__workflow_id=workflow_id)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = TriggerWorkflowRunSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        wv_id = serializer.validated_data["workflow_version_id"]
        version = get_object_or_404(
            WorkflowVersion, id=wv_id, workflow__tenant=request.tenant
        )

        run = WorkflowRun.objects.create(
            tenant=request.tenant,
            workflow_version=version,
            status=RunStatus.RUNNING,
            trigger_payload=serializer.validated_data.get("trigger_payload", {}),
            context_data={"source": "api_manual_trigger"},
        )

        # Generate simulated node executions based on definition
        definition = version.definition or {}
        nodes = definition.get("nodes", [])
        start_t = timezone.now()

        for idx, node in enumerate(nodes):
            NodeExecution.objects.create(
                tenant=request.tenant,
                run=run,
                node_id=node.get("id", f"node_{idx}"),
                node_type=node.get("type", "generic"),
                status=RunStatus.COMPLETED,
                inputs={"data": run.trigger_payload},
                outputs={"success": True, "result": f"Node {node.get('label', node.get('id'))} executed."},
                duration_ms=45 + (idx * 20),
            )

        run.status = RunStatus.COMPLETED
        run.completed_at = timezone.now()
        run.save(update_fields=["status", "completed_at"])

        return Response(WorkflowRunSerializer(run).data, status=status.HTTP_201_CREATED)


class WorkflowRunDetailView(generics.RetrieveAPIView):
    serializer_class = WorkflowRunSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return WorkflowRun.objects.filter(tenant=self.request.tenant).prefetch_related("node_executions")
