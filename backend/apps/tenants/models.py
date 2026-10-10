import uuid
from django.conf import settings
from django.db import models
from django.utils.text import slugify


class TenantStatus(models.TextChoices):
    ACTIVE = "active", "نشط"
    TRIAL = "trial", "فترة تجريبية"
    SUSPENDED = "suspended", "موقوف"


class Tenant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField("اسم المؤسسة", max_length=200)
    slug = models.SlugField("المعرف الفريد (Slug)", max_length=100, unique=True, db_index=True)
    status = models.CharField("الحالة", max_length=20, choices=TenantStatus.choices, default=TenantStatus.TRIAL)
    timezone = models.CharField("المنطقة الزمنية", max_length=50, default="Asia/Riyadh")
    settings = models.JSONField("إعدادات المؤسسة", default=dict, blank=True)
    created_at = models.DateTimeField("تاريخ الإنشاء", auto_now_add=True)
    updated_at = models.DateTimeField("تاريخ التحديث", auto_now=True)

    class Meta:
        verbose_name = "مؤسسة"
        verbose_name_plural = "المؤسسات"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.slug})"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name, allow_unicode=True) or f"org-{uuid.uuid4().hex[:8]}"
            slug = base_slug
            counter = 1
            while Tenant.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class MembershipRole(models.TextChoices):
    OWNER = "owner", "مالك المؤسسة"
    ADMIN = "admin", "مدير نظام"
    MEMBER = "member", "عضو"
    AGENT = "agent", "وكيل خدمة عملاء"


class Membership(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="memberships", verbose_name="المؤسسة")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="memberships", verbose_name="المستخدم")
    role = models.CharField("الدور والصلاحية", max_length=20, choices=MembershipRole.choices, default=MembershipRole.MEMBER)
    is_default = models.BooleanField("المؤسسة الافتراضية", default=False)
    created_at = models.DateTimeField("تاريخ الانضمام", auto_now_add=True)
    updated_at = models.DateTimeField("تاريخ التحديث", auto_now=True)

    class Meta:
        verbose_name = "عضوية مؤسسة"
        verbose_name_plural = "عضويات المؤسسات"
        constraints = [
            models.UniqueConstraint(fields=["tenant", "user"], name="unique_tenant_user_membership")
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} @ {self.tenant.name} ({self.get_role_display()})"


class RolePermission(models.Model):
    role = models.CharField("الدور", max_length=20, choices=MembershipRole.choices)
    resource = models.CharField("المورد", max_length=100)  # e.g., 'inbox', 'appointments', 'workflows'
    action = models.CharField("الإجراء", max_length=50)    # e.g., 'create', 'read', 'update', 'delete', 'execute'

    class Meta:
        verbose_name = "صلاحية الدور"
        verbose_name_plural = "صلاحيات الأدوار"
        constraints = [
            models.UniqueConstraint(fields=["role", "resource", "action"], name="unique_role_resource_action")
        ]

    def __str__(self):
        return f"{self.role} -> {self.resource}:{self.action}"


class TenantAwareModel(models.Model):
    """
    Abstract base model to enforce strict tenant isolation across all multi-tenant tables.
    """
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_records",
        verbose_name="المؤسسة التابع لها"
    )
    created_at = models.DateTimeField("تاريخ الإنشاء", auto_now_add=True)
    updated_at = models.DateTimeField("تاريخ التحديث", auto_now=True)

    class Meta:
        abstract = True
