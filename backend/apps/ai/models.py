import uuid
from django.db import models
from apps.tenants.models import TenantAwareModel


class DocumentSourceType(models.TextChoices):
    TEXT = "text", "نص مباشر"
    PDF = "pdf", "ملف PDF"
    WEBSITE = "website", "رابط موقع"


class KnowledgeDocument(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField("عنوان المستند", max_length=255)
    source_type = models.CharField("نوع المصدر", max_length=20, choices=DocumentSourceType.choices, default=DocumentSourceType.TEXT)
    raw_content = models.TextField("المحتوى الخام", blank=True)
    is_active = models.BooleanField("مفعل في الإجابات", default=True)

    class Meta:
        verbose_name = "مستند معرفي"
        verbose_name_plural = "المستندات المعرفية"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.get_source_type_display()})"


class KnowledgeChunk(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(KnowledgeDocument, on_delete=models.CASCADE, related_name="chunks")
    chunk_index = models.PositiveIntegerField("ترتيب المقطع", default=0)
    content = models.TextField("نص المقطع")
    metadata = models.JSONField("بيانات إضافية", default=dict, blank=True)

    class Meta:
        verbose_name = "مقطع معرفي"
        verbose_name_plural = "المقاطع المعرفية"
        ordering = ["document", "chunk_index"]


class AIExecutionLog(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model_name = models.CharField("اسم النموذج", max_length=100)
    prompt_tokens = models.PositiveIntegerField("رموز السؤال", default=0)
    completion_tokens = models.PositiveIntegerField("رموز الإجابة", default=0)
    action_taken = models.CharField("الإجراء المتخذ", max_length=100, blank=True)
    latency_ms = models.PositiveIntegerField("زمن الاستجابة بالملي ثانية", default=0)
    timestamp = models.DateTimeField("التاريخ", auto_now_add=True)

    class Meta:
        verbose_name = "سجل ذكاء اصطناعي"
        verbose_name_plural = "سجلات الذكاء الاصطناعي"
        ordering = ["-timestamp"]
