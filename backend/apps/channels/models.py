import uuid
from django.db import models
from apps.tenants.models import TenantAwareModel


class ChannelType(models.TextChoices):
    WEBCHAT = "webchat", "الموقع الإلكتروني (Web Chat)"
    EMAIL = "email", "البريد الإلكتروني (Email)"
    TELEGRAM = "telegram", "تيليجرام (Telegram)"
    WHATSAPP = "whatsapp", "واتساب للأعمال (WhatsApp Business)"
    INSTAGRAM = "instagram", "إنستغرام (Instagram DM)"
    MESSENGER = "messenger", "فيسبوك ماسنجر (Facebook Messenger)"
    SMS = "sms", "الرسائل القصيرة (SMS Gateway)"
    TIKTOK = "tiktok", "تيك توك (TikTok DM)"
    VOICE = "voice", "الصوت والبريد الصوتي (Voice)"



class ChannelConnection(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    channel_type = models.CharField("نوع القناة", max_length=50, choices=ChannelType.choices)
    name = models.CharField("اسم الاتصال", max_length=150)
    is_active = models.BooleanField("مفعل", default=True)
    credentials = models.JSONField("بيانات الاعتماد المشفرة", default=dict, blank=True)
    webhook_secret = models.CharField("مفتاح التحقق من الويب هوك", max_length=255, blank=True)
    settings = models.JSONField("إعدادات إضافية", default=dict, blank=True)

    class Meta:
        verbose_name = "اتصال قناة"
        verbose_name_plural = "اتصالات القنوات"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.tenant.name} - {self.get_channel_type_display()} ({self.name})"


class WebhookEvent(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    channel_connection = models.ForeignKey(
        ChannelConnection, on_delete=models.CASCADE, related_name="webhook_events", null=True, blank=True
    )
    event_type = models.CharField("نوع الحدث", max_length=100)
    idempotency_key = models.CharField("مفتاح عدم التكرار", max_length=255, unique=True, db_index=True)
    payload = models.JSONField("محتوى الويب هوك", default=dict)
    processed = models.BooleanField("تمت المعالجة", default=False)
    processed_at = models.DateTimeField("تاريخ المعالجة", null=True, blank=True)

    class Meta:
        verbose_name = "حدث ويب هوك"
        verbose_name_plural = "أحداث الويب هوك"
        ordering = ["-created_at"]
