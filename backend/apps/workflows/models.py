import uuid
from django.db import models
from apps.tenants.models import TenantAwareModel


class TriggerType(models.TextChoices):
    MESSAGE_RECEIVED = "message_received", "استلام رسالة جديدة"
    APPOINTMENT_CREATED = "appointment_created", "إنشاء موعد جديد"
    WEBHOOK = "webhook", "ويب هوك خارجي"
    SCHEDULED = "scheduled", "تشغيل مجدول"


class Workflow(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField("اسم التدفق", max_length=200)
    description = models.TextField("الوصف", blank=True)
    trigger_type = models.CharField("نوع المشغل", max_length=50, choices=TriggerType.choices, default=TriggerType.MESSAGE_RECEIVED)
    is_active = models.BooleanField("مفعل", default=True)

    class Meta:
        verbose_name = "تدفق أتمتة"
        verbose_name_plural = "تدفقات الأتمتة"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.get_trigger_type_display()})"


class WorkflowVersion(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name="versions")
    version_number = models.PositiveIntegerField("رقم النسخة", default=1)
    is_published = models.BooleanField("منشورة", default=False)
    definition = models.JSONField("مخطط العقد والروابط (JSON Canvas)", default=dict)

    class Meta:
        verbose_name = "نسخة تدفق"
        verbose_name_plural = "نسخ التدفقات"
        constraints = [
            models.UniqueConstraint(fields=["workflow", "version_number"], name="unique_workflow_version")
        ]
        ordering = ["-version_number"]

    def __str__(self):
        return f"{self.workflow.name} v{self.version_number} ({'منشورة' if self.is_published else 'مسودة'})"
