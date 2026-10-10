import uuid
from django.db import models
from apps.tenants.models import TenantAwareModel
from apps.workflows.models import WorkflowVersion


class RunStatus(models.TextChoices):
    PENDING = "pending", "في الانتظار"
    RUNNING = "running", "قيد التشغيل"
    COMPLETED = "completed", "مكتمل بنجاح"
    FAILED = "failed", "فشل"
    PAUSED = "paused", "متوقف مؤقتاً"


class WorkflowRun(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow_version = models.ForeignKey(WorkflowVersion, on_delete=models.CASCADE, related_name="runs")
    status = models.CharField("الحالة", max_length=20, choices=RunStatus.choices, default=RunStatus.PENDING)
    trigger_payload = models.JSONField("بيانات المشغل", default=dict)
    context_data = models.JSONField("سياق وبيانات التنفيذ", default=dict)
    started_at = models.DateTimeField("بدء التشغيل", auto_now_add=True)
    completed_at = models.DateTimeField("انتهاء التشغيل", null=True, blank=True)
    error_message = models.TextField("رسالة الخطأ إن وجدت", blank=True)

    class Meta:
        verbose_name = "تشغيل تدفق"
        verbose_name_plural = "سجلات تشغيل التدفقات"
        ordering = ["-started_at"]

    def __str__(self):
        return f"تشغيل #{str(self.id)[:8]} ({self.get_status_display()})"


class NodeExecution(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    run = models.ForeignKey(WorkflowRun, on_delete=models.CASCADE, related_name="node_executions")
    node_id = models.CharField("معرف العقدة", max_length=100)
    node_type = models.CharField("نوع العقدة", max_length=100)
    status = models.CharField("الحالة", max_length=20, choices=RunStatus.choices, default=RunStatus.PENDING)
    inputs = models.JSONField("المدخلات", default=dict)
    outputs = models.JSONField("المخرجات", default=dict)
    duration_ms = models.PositiveIntegerField("مدة التنفيذ بالملي ثانية", default=0)
    error_message = models.TextField("رسالة الخطأ", blank=True)
    executed_at = models.DateTimeField("تاريخ التنفيذ", auto_now_add=True)

    class Meta:
        verbose_name = "تنفيذ عقدة"
        verbose_name_plural = "تنفيذات العقد"
        ordering = ["executed_at"]


class IdempotencyKey(TenantAwareModel):
    key = models.CharField("مفتاح منع التكرار", max_length=255, unique=True, db_index=True)
    resource_type = models.CharField("نوع الإجراء أو المورد", max_length=100)
    response_payload = models.JSONField("نتيجة الإجراء المخزنة", default=dict)
    created_at = models.DateTimeField("تاريخ التسجيل", auto_now_add=True)

    class Meta:
        verbose_name = "مفتاح عدم التكرار"
        verbose_name_plural = "مفاتيح عدم التكرار"
