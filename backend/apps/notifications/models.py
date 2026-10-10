import uuid
from django.conf import settings
from django.db import models
from apps.tenants.models import TenantAwareModel
from apps.contacts.models import Contact
from apps.scheduling.models import Appointment


class Reminder(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name="reminders")
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="reminders")
    scheduled_for = models.DateTimeField("وقت التذكير المجدول", db_index=True)
    channel_type = models.CharField("نوع القناة", max_length=50, default="whatsapp")
    message_template = models.TextField("نص التذكير", blank=True)
    sent = models.BooleanField("تم الإرسال", default=False)
    sent_at = models.DateTimeField("تاريخ الإرسال الفعلي", null=True, blank=True)

    class Meta:
        verbose_name = "تذكير مجدول"
        verbose_name_plural = "التذكيرات المجدولة"
        ordering = ["scheduled_for"]


class Notification(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField("العنوان", max_length=255)
    body = models.TextField("المحتوى")
    read = models.BooleanField("مقروء", default=False)
    link = models.CharField("الرابط الداخلي", max_length=255, blank=True)

    class Meta:
        verbose_name = "إشعار"
        verbose_name_plural = "الإشعارات"
        ordering = ["-created_at"]
