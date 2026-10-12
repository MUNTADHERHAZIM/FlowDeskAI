from rest_framework import serializers
from apps.billing.models import Subscription, UsageRecord, SubscriptionStatus


class SubscriptionSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Subscription
        fields = [
            "id",
            "plan_id",
            "status",
            "status_display",
            "current_period_start",
            "current_period_end",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class UsageRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsageRecord
        fields = ["id", "metric", "quantity", "period", "created_at"]
        read_only_fields = ["id", "created_at"]


class ChangePlanSerializer(serializers.Serializer):
    plan_id = serializers.ChoiceField(choices=["starter", "professional", "enterprise"])
