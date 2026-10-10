import uuid
from django.conf import settings
from django.db import models
from apps.tenants.models import TenantAwareModel


class AuditEvent(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField("نوع الإجراء", max_length=100)  # e.g., 'appointment.canceled', 'workflow.published'
    resource_type = models.CharField("نوع المورد", max_length=100)
    resource_id = models.CharField("معرف المورد", max_length=100)
    ip_address = models.GenericIPAddressField("عنوان IP", null=True, blank=True)
    changes = models.JSONField("تفاصيل التغييرات", default=dict, blank=True)
    timestamp = models.DateTimeField("وقت الحدث", auto_now_add=True)

    class Meta:
        verbose_name = "سجل تدقيق"
        verbose_name_plural = "سجلات التدقيق"
        ordering = ["-timestamp"]

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {self.action} by {self.actor or 'System'}"
