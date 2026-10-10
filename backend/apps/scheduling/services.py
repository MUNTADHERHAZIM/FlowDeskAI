from datetime import datetime, timedelta
from typing import List, Optional
from django.db import transaction
from django.utils import timezone
from apps.scheduling.models import (
    Appointment,
    AppointmentResource,
    AppointmentStatus,
    Resource,
    Service,
)
from apps.contacts.models import Contact
from apps.tenants.models import Tenant


class DoubleBookingConflictError(Exception):
    """Raised when an appointment conflicts with an existing booking for any required resource."""
    pass


class SchedulingService:
    """
    Dedicated Scheduling Engine Service.
    Enforces atomic booking, tenant isolation, and multi-resource conflict detection.
    """

    def __init__(self, tenant: Tenant):
        self.tenant = tenant

    def check_availability(
        self,
        resource_ids: List[str],
        start_time: datetime,
        end_time: datetime,
        exclude_appointment_id: Optional[str] = None,
    ) -> bool:
        """
        Checks if ALL specified resources are completely free within [start_time, end_time].
        """
        # Find any overlapping active appointments for the requested resources
        overlapping = (
            Appointment.objects.filter(
                tenant=self.tenant,
                status__in=[AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING],
                start_time__lt=end_time,
                end_time__gt=start_time,
                appointment_resources__resource_id__in=resource_ids,
            )
        )

        if exclude_appointment_id:
            overlapping = overlapping.exclude(id=exclude_appointment_id)

        return not overlapping.exists()

    @transaction.atomic
    def book_appointment(
        self,
        service: Service,
        contact: Contact,
        start_time: datetime,
        resource_ids: List[str],
        notes: str = "",
    ) -> Appointment:
        """
        Atomically locks resources and creates an appointment if and only if
        there are zero conflicts across all required resources.
        """
        duration = service.duration_minutes
        end_time = start_time + timedelta(minutes=duration)

        # 1. Lock the resources rows using select_for_update to serialize concurrent bookings
        locked_resources = list(
            Resource.objects.select_for_update()
            .filter(tenant=self.tenant, id__in=resource_ids, is_active=True)
        )

        if len(locked_resources) != len(resource_ids):
            raise ValueError("واحد أو أكثر من الموارد المطلوبة غير موجود أو غير مفعل في هذه المؤسسة.")

        # 2. Check for double booking conflicts atomically
        is_free = self.check_availability(
            resource_ids=[str(r.id) for r in locked_resources],
            start_time=start_time,
            end_time=end_time,
        )

        if not is_free:
            raise DoubleBookingConflictError(
                "تعارض في الحجز: أحد الموارد المطلوبة محجوز بالفعل في هذا التوقيت."
            )

        # 3. Create Appointment
        appointment = Appointment.objects.create(
            tenant=self.tenant,
            service=service,
            contact=contact,
            start_time=start_time,
            end_time=end_time,
            status=AppointmentStatus.CONFIRMED,
            notes=notes,
        )

        # 4. Link resources
        for resource in locked_resources:
            AppointmentResource.objects.create(
                tenant=self.tenant,
                appointment=appointment,
                resource=resource,
            )

        return appointment
