from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
from apps.billing.models import Subscription, UsageRecord, SubscriptionStatus
from apps.billing.serializers import SubscriptionSerializer, UsageRecordSerializer, ChangePlanSerializer
from apps.tenants.permissions import IsTenantMember


class SubscriptionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get(self, request):
        tenant = request.tenant
        sub, created = Subscription.objects.get_or_create(
            tenant=tenant,
            defaults={
                "plan_id": "professional",
                "status": SubscriptionStatus.ACTIVE,
                "current_period_end": timezone.now() + timedelta(days=30),
            },
        )
        serializer = SubscriptionSerializer(sub)
        return Response(serializer.data)

    def post(self, request):
        tenant = request.tenant
        serializer = ChangePlanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_plan = serializer.validated_data["plan_id"]
        sub, _ = Subscription.objects.get_or_create(tenant=tenant)
        sub.plan_id = new_plan
        sub.status = SubscriptionStatus.ACTIVE
        sub.current_period_end = timezone.now() + timedelta(days=30)
        sub.save()

        return Response(SubscriptionSerializer(sub).data, status=status.HTTP_200_OK)


class UsageRecordListView(generics.ListAPIView):
    serializer_class = UsageRecordSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return UsageRecord.objects.filter(tenant=self.request.tenant)
