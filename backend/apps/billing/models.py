import uuid
from django.db import models
from apps.tenants.models import Tenant, TenantAwareModel


class SubscriptionStatus(models.TextChoices):
    TRIAL = "trial", "تجريبي"
    ACTIVE = "active", "نشط"
    PAST_DUE = "past_due", "متعثر"
    CANCELED = "canceled", "ملغى"


class Subscription(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan_id = models.CharField("معرف الخطة", max_length=50, default="starter")
    status = models.CharField("حالة الاشتراك", max_length=20, choices=SubscriptionStatus.choices, default=SubscriptionStatus.TRIAL)
    current_period_start = models.DateTimeField("بداية الفترة الحالية", auto_now_add=True)
    current_period_end = models.DateTimeField("نهاية الفترة الحالية", null=True, blank=True)

    class Meta:
        verbose_name = "اشتراك"
        verbose_name_plural = "الاشتراكات"

    def __str__(self):
        return f"{self.tenant.name} - {self.plan_id} ({self.status})"


class UsageRecord(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    metric = models.CharField("المقياس", max_length=100)  # e.g., messages_sent, ai_tokens, workflows_run
    quantity = models.PositiveIntegerField("الكمية", default=0)
    period = models.CharField("الفترة", max_length=20)   # e.g., '2026-10'

    class Meta:
        verbose_name = "سجل استهلاك"
        verbose_name_plural = "سجلات الاستهلاك"
        constraints = [
            models.UniqueConstraint(fields=["tenant", "metric", "period"], name="unique_tenant_metric_period")
        ]

    def __str__(self):
        return f"{self.tenant.name} - {self.metric}: {self.quantity} ({self.period})"
