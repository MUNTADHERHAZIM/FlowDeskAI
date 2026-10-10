import uuid
from django.db import models
from apps.tenants.models import TenantAwareModel


class Contact(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField("اسم العميل", max_length=200, blank=True)
    email = models.EmailField("البريد الإلكتروني", blank=True, null=True, db_index=True)
    phone_number = models.CharField("رقم الهاتف", max_length=50, blank=True, null=True, db_index=True)
    custom_attributes = models.JSONField("سمات مخصصة", default=dict, blank=True)
    tags = models.JSONField("الوسوم", default=list, blank=True)

    class Meta:
        verbose_name = "عميل"
        verbose_name_plural = "العملاء"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name or self.phone_number or self.email or str(self.id)


class ExternalIdentity(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="external_identities", verbose_name="العميل")
    channel_type = models.CharField("نوع القناة", max_length=50)  # whatsapp, telegram, email, webchat
    external_id = models.CharField("المعرف الخارجي", max_length=255, db_index=True)
    metadata = models.JSONField("بيانات إضافية", default=dict, blank=True)

    class Meta:
        verbose_name = "هوية خارجية"
        verbose_name_plural = "الهويات الخارجية"
        constraints = [
            models.UniqueConstraint(fields=["tenant", "channel_type", "external_id"], name="unique_tenant_channel_external_id")
        ]

    def __str__(self):
        return f"{self.channel_type}:{self.external_id} -> {self.contact}"


class ConsentRecord(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="consents", verbose_name="العميل")
    channel_type = models.CharField("نوع القناة", max_length=50)
    granted = models.BooleanField("الموافقة ممنوحة", default=True)
    opt_in_timestamp = models.DateTimeField("تاريخ منح الموافقة", auto_now_add=True)

    class Meta:
        verbose_name = "سجل موافقة"
        verbose_name_plural = "سجلات الموافقة"
