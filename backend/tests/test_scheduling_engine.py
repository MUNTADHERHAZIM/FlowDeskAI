import pytest
from datetime import timedelta
from django.utils import timezone
from apps.identity.models import User
from apps.tenants.models import Tenant, Membership, MembershipRole
from apps.contacts.models import Contact
from apps.scheduling.models import Service, Resource, ResourceType
from apps.scheduling.services import SchedulingService, DoubleBookingConflictError


@pytest.mark.django_db
def test_scheduling_service_prevents_double_booking_atomically():
    tenant = Tenant.objects.create(name="عيادة النخبة للعيون")
    doctor = Resource.objects.create(tenant=tenant, name="د. أحمد التميمي", resource_type=ResourceType.STAFF)
    clinic_room = Resource.objects.create(tenant=tenant, name="عيادة 1", resource_type=ResourceType.ROOM)
    service = Service.objects.create(tenant=tenant, name="كشف بصري", duration_minutes=30)
    contact1 = Contact.objects.create(tenant=tenant, name="عميل 1")
    contact2 = Contact.objects.create(tenant=tenant, name="عميل 2")

    scheduler = SchedulingService(tenant=tenant)
    slot_time = timezone.now() + timedelta(days=2, hours=10)

    # 1. First booking succeeds
    appointment1 = scheduler.book_appointment(
        service=service,
        contact=contact1,
        start_time=slot_time,
        resource_ids=[str(doctor.id), str(clinic_room.id)],
    )
    assert appointment1 is not None
    assert appointment1.status == "confirmed"

    # 2. Conflicting booking for the same doctor at the same slot MUST raise DoubleBookingConflictError
    with pytest.raises(DoubleBookingConflictError):
        scheduler.book_appointment(
            service=service,
            contact=contact2,
            start_time=slot_time + timedelta(minutes=10),  # overlaps by 20 minutes!
            resource_ids=[str(doctor.id)],
        )

    # 3. Non-overlapping booking (after slot 1 ends) succeeds
    appointment3 = scheduler.book_appointment(
        service=service,
        contact=contact2,
        start_time=slot_time + timedelta(minutes=30),  # immediately after
        resource_ids=[str(doctor.id), str(clinic_room.id)],
    )
    assert appointment3 is not None
    assert appointment3.status == "confirmed"
