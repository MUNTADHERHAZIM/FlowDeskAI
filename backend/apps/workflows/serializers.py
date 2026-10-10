from rest_framework import serializers
from apps.workflows.models import Workflow, WorkflowVersion


class WorkflowVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowVersion
        fields = ["id", "workflow", "version_number", "is_published", "definition", "created_at"]
        read_only_fields = ["id", "created_at"]


class WorkflowSerializer(serializers.ModelSerializer):
    latest_version = serializers.SerializerMethodField()

    class Meta:
        model = Workflow
        fields = ["id", "name", "description", "trigger_type", "is_active", "created_at", "latest_version"]
        read_only_fields = ["id", "created_at"]

    def get_latest_version(self, obj):
        v = obj.versions.order_by("-version_number").first()
        if v:
            return WorkflowVersionSerializer(v).data
        return None
