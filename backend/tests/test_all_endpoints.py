import pytest
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIClient
from apps.identity.models import User
from apps.tenants.models import Tenant, Membership, MembershipRole
from apps.workflows.models import Workflow, WorkflowVersion, TriggerType
from apps.channels.models import ChannelConnection, ChannelType
from apps.contacts.models import Contact
from apps.scheduling.models import Service, Resource, ResourceType


@pytest.mark.django_db
def test_all_enterprise_modules_and_tenant_isolation():
    # Setup test user and tenant
    user = User.objects.create_user(email="pro@flowdesk.test", password="Password123!")
    tenant = Tenant.objects.create(name="مختبر بغداد المتقدم", slug="baghdad-lab")
    Membership.objects.create(user=user, tenant=tenant, role=MembershipRole.OWNER, is_default=True)

    client = APIClient()
    client.force_authenticate(user=user)
    headers = {"HTTP_X_TENANT_ID": str(tenant.id)}

    # 1. Billing Subscription
    sub_res = client.get("/api/v1/billing/subscription/", **headers)
    assert sub_res.status_code == 200
    assert sub_res.data["plan_id"] == "professional"

    # Plan upgrade
    upgrade_res = client.post("/api/v1/billing/subscription/", {"plan_id": "enterprise"}, format="json", **headers)
    assert upgrade_res.status_code == 200
    assert upgrade_res.data["plan_id"] == "enterprise"

    # 2. Notifications
    notif_res = client.get("/api/v1/notifications/", **headers)
    assert notif_res.status_code == 200

    read_all = client.post("/api/v1/notifications/read/", **headers)
    assert read_all.status_code == 200

    # 3. Channels & Inbound Webhook
    channel_create = client.post(
        "/api/v1/channels/",
        {
            "channel_type": ChannelType.WHATSAPP,
            "name": "رقم واتساب العيادة الموحد",
            "is_active": True,
            "credentials": {"phone_number_id": "100928392", "access_token": "secret_token"},
        },
        format="json",
        **headers,
    )
    assert channel_create.status_code == 201
    channel_id = channel_create.data["id"]

    webhook_url = f"/api/v1/channels/{channel_id}/webhook/"
    webhook_payload = {
        "event": "messages.received",
        "message_id": "msg_iq_99812",
        "sender": "+9647801234567",
        "text": "مرحباً، أود حجز موعد استشارة",
    }
    wh_first = client.post(webhook_url, webhook_payload, format="json", HTTP_X_IDEMPOTENCY_KEY="idemp-key-1")
    assert wh_first.status_code == 201
    assert wh_first.data["status"] == "processed"

    # Duplicate call with same idempotency key must not duplicate
    wh_second = client.post(webhook_url, webhook_payload, format="json", HTTP_X_IDEMPOTENCY_KEY="idemp-key-1")
    assert wh_second.status_code == 200
    assert wh_second.data["status"] == "already_processed"

    # Public WebChat Endpoint test (/api/v1/channels/webchat/webhook/)
    webchat_res = client.post(
        "/api/v1/channels/webchat/webhook/",
        {"sender_id": "+9647809988776", "sender_name": "زائر الشات المباشر", "text": "أود معرفة أوقات العمل"},
        format="json",
        **headers,
    )
    assert webchat_res.status_code == 201
    assert webchat_res.data["status"] == "processed"
    assert "reply" in webchat_res.data

    # 4. Contacts & External Identities
    contact_res = client.post(
        "/api/v1/contacts/",
        {"name": "علي البصري", "phone_number": "+9647801122334", "email": "ali@basra.test"},
        format="json",
        **headers,
    )
    assert contact_res.status_code == 201
    contact_id = contact_res.data["id"]

    # Search contacts
    search_res = client.get("/api/v1/contacts/?q=علي", **headers)
    assert search_res.status_code == 200
    assert len(search_res.data) >= 1

    # Link external WhatsApp identity
    identity_res = client.post(
        f"/api/v1/contacts/{contact_id}/identities/",
        {"channel_type": "whatsapp", "external_id": "wa_9647801122334"},
        format="json",
        **headers,
    )
    assert identity_res.status_code == 201

    # 5. Atomic Scheduling API & Conflict Detection
    service = Service.objects.create(tenant=tenant, name="كشف تخصصي", duration_minutes=30)
    doctor = Resource.objects.create(tenant=tenant, name="د. مهند الحسني", resource_type=ResourceType.STAFF)
    slot_time = timezone.now() + timedelta(days=3, hours=9)

    # Check availability endpoint
    avail_check = client.post(
        "/api/v1/scheduling/availability/",
        {
            "resource_ids": [str(doctor.id)],
            "start_time": slot_time.isoformat(),
            "duration_minutes": 30,
        },
        format="json",
        **headers,
    )
    assert avail_check.status_code == 200
    assert avail_check.data["is_available"] is True

    # Book first appointment
    book_res1 = client.post(
        "/api/v1/scheduling/appointments/",
        {
            "service": str(service.id),
            "contact": str(contact_id),
            "start_time": slot_time.isoformat(),
            "resource_ids": [str(doctor.id)],
            "notes": "حجز موعد أولي",
        },
        format="json",
        **headers,
    )
    assert book_res1.status_code == 201
    assert len(book_res1.data["resources"]) == 1

    # Conflicting booking MUST return 409 Conflict
    conflict_time = slot_time + timedelta(minutes=15)
    book_res2 = client.post(
        "/api/v1/scheduling/appointments/",
        {
            "service": str(service.id),
            "contact": str(contact_id),
            "start_time": conflict_time.isoformat(),
            "resource_ids": [str(doctor.id)],
            "notes": "حجز متعارض",
        },
        format="json",
        **headers,
    )
    assert book_res2.status_code == 409
    assert book_res2.data["code"] == "DOUBLE_BOOKING_CONFLICT"

    # 6. Workflow Runtime
    wf = Workflow.objects.create(
        tenant=tenant,
        name="تدفق المعالجة التلقائية",
        trigger_type=TriggerType.MESSAGE_RECEIVED,
        is_active=True,
    )
    wv = WorkflowVersion.objects.create(
        tenant=tenant,
        workflow=wf,
        version_number=1,
        is_published=True,
        definition={
            "nodes": [
                {"id": "n1", "type": "trigger", "label": "استلام رسالة"},
                {"id": "n2", "type": "ai", "label": "استخراج النية بالذكاء الاصطناعي"},
            ],
            "edges": [{"source": "n1", "target": "n2"}],
        },
    )

    run_res = client.post(
        "/api/v1/runtime/runs/",
        {"workflow_version_id": str(wv.id), "trigger_payload": {"text": "حجز موعد"}},
        format="json",
        **headers,
    )
    assert run_res.status_code == 201
    assert run_res.data["status"] == "completed"
    assert len(run_res.data["node_executions"]) == 2

    # 7. Audit Log
    audit_res = client.get("/api/v1/audit/", **headers)
    assert audit_res.status_code == 200
