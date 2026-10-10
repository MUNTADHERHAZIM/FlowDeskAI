import uuid
from django.conf import settings
from django.db import models
from apps.tenants.models import TenantAwareModel
from apps.contacts.models import Contact
from apps.channels.models import ChannelConnection


class ConversationStatus(models.TextChoices):
    OPEN = "open", "مفتوحة"
    PENDING = "pending", "معلقة"
    CLOSED = "closed", "مغلقة"


class Conversation(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="conversations", verbose_name="العميل")
    channel_connection = models.ForeignKey(
        ChannelConnection, on_delete=models.SET_NULL, null=True, blank=True, related_name="conversations", verbose_name="القناة"
    )
    status = models.CharField("حالة المحادثة", max_length=20, choices=ConversationStatus.choices, default=ConversationStatus.OPEN)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_conversations", verbose_name="الموظف المسؤول"
    )
    last_message_at = models.DateTimeField("تاريخ آخر رسالة", auto_now=True)
    metadata = models.JSONField("بيانات إضافية", default=dict, blank=True)

    class Meta:
        verbose_name = "محادثة"
        verbose_name_plural = "المحادثات"
        ordering = ["-last_message_at"]

    def __str__(self):
        return f"محادثة #{str(self.id)[:8]} - {self.contact.name or self.contact.id}"


class MessageDirection(models.TextChoices):
    INBOUND = "inbound", "واردة"
    OUTBOUND = "outbound", "صادرة"


class MessageType(models.TextChoices):
    TEXT = "text", "نص"
    IMAGE = "image", "صورة"
    DOCUMENT = "document", "مستند"
    AUDIO = "audio", "صوت"
    SYSTEM = "system", "نظام"


class DeliveryStatus(models.TextChoices):
    QUEUED = "queued", "في قائمة الانتظار"
    SENT = "sent", "تم الإرسال"
    DELIVERED = "delivered", "تم الاستلام"
    READ = "read", "تمت القراءة"
    FAILED = "failed", "فشل الإرسال"


class Message(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages", verbose_name="المحادثة")
    channel_connection = models.ForeignKey(
        ChannelConnection, on_delete=models.SET_NULL, null=True, blank=True, related_name="messages"
    )
    provider_message_id = models.CharField("معرف الرسالة الخارجي", max_length=255, blank=True, db_index=True)
    direction = models.CharField("الاتجاه", max_length=20, choices=MessageDirection.choices)
    message_type = models.CharField("نوع الرسالة", max_length=20, choices=MessageType.choices, default=MessageType.TEXT)
    text_content = models.TextField("نص الرسالة", blank=True)
    delivery_status = models.CharField("حالة التسليم", max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.SENT)
    sent_at = models.DateTimeField("تاريخ الإرسال", null=True, blank=True)
    delivered_at = models.DateTimeField("تاريخ الاستلام", null=True, blank=True)
    metadata = models.JSONField("بيانات إضافية", default=dict, blank=True)

    class Meta:
        verbose_name = "رسالة"
        verbose_name_plural = "الرسائل"
        ordering = ["created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["channel_connection", "provider_message_id"],
                condition=models.Q(provider_message_id__gt=""),
                name="unique_channel_provider_message_id"
            )
        ]

    def __str__(self):
        return f"{self.get_direction_display()}: {self.text_content[:30]}"


class Attachment(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to="attachments/%Y/%m/%d/", blank=True, null=True)
    file_url = models.URLField("رابط الملف الخارجي", max_length=500, blank=True)
    file_name = models.CharField("اسم الملف", max_length=255)
    file_size = models.PositiveIntegerField("حجم الملف بالبايت", default=0)
    content_type = models.CharField("نوع المحتوى", max_length=100)

    class Meta:
        verbose_name = "مرفق"
        verbose_name_plural = "المرفقات"


class TicketPriority(models.TextChoices):
    LOW = "low", "منخفضة"
    MEDIUM = "medium", "متوسطة"
    HIGH = "high", "عالية"
    URGENT = "urgent", "حرجة"


class TicketStatus(models.TextChoices):
    NEW = "new", "جديدة"
    IN_PROGRESS = "in_progress", "قيد المعالجة"
    RESOLVED = "resolved", "تم الحل"
    CLOSED = "closed", "مغلقة"


class Ticket(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="tickets")
    title = models.CharField("عنوان التذكرة", max_length=255)
    description = models.TextField("وصف التذكرة", blank=True)
    priority = models.CharField("الأولوية", max_length=20, choices=TicketPriority.choices, default=TicketPriority.MEDIUM)
    status = models.CharField("الحالة", max_length=20, choices=TicketStatus.choices, default=TicketStatus.NEW)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = "تذكرة متابعة"
        verbose_name_plural = "تذاكر المتابعة"
        ordering = ["-created_at"]
