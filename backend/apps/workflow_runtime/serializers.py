from rest_framework import serializers
from apps.workflow_runtime.models import WorkflowRun, NodeExecution, RunStatus


class NodeExecutionSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = NodeExecution
        fields = [
            "id",
            "node_id",
            "node_type",
            "status",
            "status_display",
            "inputs",
            "outputs",
            "duration_ms",
            "error_message",
            "executed_at",
        ]
        read_only_fields = ["id", "executed_at"]


class WorkflowRunSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    workflow_name = serializers.CharField(source="workflow_version.workflow.name", read_only=True)
    node_executions = NodeExecutionSerializer(many=True, read_only=True)

    class Meta:
        model = WorkflowRun
        fields = [
            "id",
            "workflow_version",
            "workflow_name",
            "status",
            "status_display",
            "trigger_payload",
            "context_data",
            "started_at",
            "completed_at",
            "error_message",
            "node_executions",
        ]
        read_only_fields = ["id", "started_at"]


class TriggerWorkflowRunSerializer(serializers.Serializer):
    workflow_version_id = serializers.UUIDField()
    trigger_payload = serializers.JSONField(required=False, default=dict)
