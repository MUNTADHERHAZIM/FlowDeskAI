import uuid
from django.conf import settings
from django.db import models
from apps.tenants.models import TenantAwareModel
from apps.contacts.models import Contact


class Service(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField("اسم الخدمة", max_length=200)
    description = models.TextField("وصف الخدمة", blank=True)
    duration_minutes = models.PositiveIntegerField("المدة بالدقائق", default=30)
    buffer_before = models.PositiveIntegerField("وقت فاصل قبل الموعد (بالدقائق)", default=0)
    buffer_after = models.PositiveIntegerField("وقت فاصل بعد الموعد (بالدقائق)", default=0)
    price = models.DecimalField("السعر", max_digits=10, decimal_places=2, default=0.00)
    is_active = models.BooleanField("مفعلة", default=True)

    class Meta:
        verbose_name = "خدمة"
        verbose_name_plural = "الخدمات"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.duration_minutes} دقيقة)"


class ResourceType(models.TextChoices):
    STAFF = "staff", "موظف / مختص"
    ROOM = "room", "غرفة / عيادة / قاعة"
    EQUIPMENT = "equipment", "جهاز / معدات"


class Resource(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField("اسم المورد", max_length=200)
    resource_type = models.CharField("نوع المورد", max_length=20, choices=ResourceType.choices, default=ResourceType.STAFF)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_resources", verbose_name="المستخدم المرتبط"
    )
    capacity = models.PositiveIntegerField("السعة الاستيعابية", default=1)
    is_active = models.BooleanField("مفعل", default=True)

    class Meta:
        verbose_name = "مورد"
        verbose_name_plural = "الموارد"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.get_resource_type_display()})"


class ResourceAvailability(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="availabilities", verbose_name="المورد")
    day_of_week = models.PositiveSmallIntegerField("يوم الأسبوع (0=الاثنين .. 6=الأحد)")
    start_time = models.TimeField("بداية فترة العمل")
    end_time = models.TimeField("نهاية فترة العمل")

    class Meta:
        verbose_name = "توافر مورد"
        verbose_name_plural = "توافر الموارد"
        ordering = ["day_of_week", "start_time"]


class AppointmentStatus(models.TextChoices):
    PENDING = "pending", "معلق"
    CONFIRMED = "confirmed", "مؤكد"
    COMPLETED = "completed", "مكتمل"
    CANCELED = "canceled", "ملغى"
    NO_SHOW = "no_show", "لم يحضر"


class Appointment(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(Service, on_delete=models.PROTECT, related_name="appointments", verbose_name="الخدمة")
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="appointments", verbose_name="العميل")
    start_time = models.DateTimeField("وقت بداية الموعد", db_index=True)
    end_time = models.DateTimeField("وقت نهاية الموعد", db_index=True)
    status = models.CharField("حالة الموعد", max_length=20, choices=AppointmentStatus.choices, default=AppointmentStatus.CONFIRMED)
    cancellation_reason = models.TextField("سبب الإلغاء", blank=True)
    notes = models.TextField("ملاحظات", blank=True)

    class Meta:
        verbose_name = "موعد"
        verbose_name_plural = "المواعيد"
        ordering = ["-start_time"]

    def __str__(self):
        return f"{self.service.name} - {self.contact.name} ({self.start_time.strftime('%Y-%m-%d %H:%M')})"


class AppointmentResource(TenantAwareModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name="appointment_resources")
    resource = models.ForeignKey(Resource, on_delete=models.PROTECT, related_name="resource_appointments")

    class Meta:
        verbose_name = "مورد موعد"
        verbose_name_plural = "موارد المواعيد"
        constraints = [
            models.UniqueConstraint(fields=["appointment", "resource"], name="unique_appointment_resource")
        ]
