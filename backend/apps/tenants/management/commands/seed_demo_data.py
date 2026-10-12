from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.identity.models import User
from apps.tenants.models import Tenant, Membership, MembershipRole
from apps.channels.models import ChannelConnection, ChannelType
from apps.contacts.models import Contact, ExternalIdentity
from apps.inbox.models import Conversation, Message, MessageDirection, MessageType, DeliveryStatus
from apps.scheduling.models import Service, Resource, ResourceType, Appointment, AppointmentResource
from apps.workflows.models import Workflow, WorkflowVersion, TriggerType
from apps.ai.models import KnowledgeDocument, KnowledgeChunk


class Command(BaseCommand):
    help = "Seeds initial demo data for FlowDesk AI multi-tenant platform (Iraq - Basra Edition)"

    def handle(self, *args, **options):
        self.stdout.write("Beggining database seeding for FlowDesk AI (Iraq / Basra)...")

        # 1. Create Superuser / Developer Account (Muntadher Hazim - Basra, Iraq)
        admin_user, created = User.objects.get_or_create(
            email="muntadher@flowdesk.iq",
            defaults={
                "first_name": "منتظر",
                "last_name": "حازم",
                "phone_number": "+9647801234567",
                "is_staff": True,
                "is_superuser": True,
            }
        )
        if created:
            admin_user.set_password("AdminPass123!")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created developer account: muntadher@flowdesk.iq (منتظر حازم)"))

        # 2. Create Tenant: مركز البصرة الطبي التخصصي
        clinic_tenant, _ = Tenant.objects.get_or_create(
            slug="basra-medical-center",
            defaults={
                "name": "مركز البصرة الطبي التخصصي",
                "timezone": "Asia/Baghdad",
                "status": "active",
            }
        )

        # 3. Create Tenant: مجموعة الرافدين القانونية - البصرة
        law_tenant, _ = Tenant.objects.get_or_create(
            slug="alrafidain-law-basra",
            defaults={
                "name": "مجموعة الرافدين القانونية - البصرة",
                "timezone": "Asia/Baghdad",
                "status": "active",
            }
        )

        # 4. Memberships
        Membership.objects.get_or_create(
            tenant=clinic_tenant,
            user=admin_user,
            defaults={"role": MembershipRole.OWNER, "is_default": True}
        )
        Membership.objects.get_or_create(
            tenant=law_tenant,
            user=admin_user,
            defaults={"role": MembershipRole.ADMIN, "is_default": False}
        )

        # 5. Omnichannel Connections (Iraq)
        whatsapp_conn, _ = ChannelConnection.objects.get_or_create(
            tenant=clinic_tenant,
            channel_type=ChannelType.WHATSAPP,
            defaults={
                "name": "واتساب المركز الرسمي (+964 780 123 4567)",
                "is_active": True,
                "webhook_secret": "whsec_flowdesk_iraq_whatsapp_2026",
            }
        )
        telegram_conn, _ = ChannelConnection.objects.get_or_create(
            tenant=clinic_tenant,
            channel_type=ChannelType.TELEGRAM,
            defaults={
                "name": "بوت تيليجرام حجز عيادة البصرة (@BasraClinicBot)",
                "is_active": True,
            }
        )

        # 6. Contacts (Iraq)
        contact_sara, _ = Contact.objects.get_or_create(
            tenant=clinic_tenant,
            email="sara.basra@example.com",
            defaults={
                "name": "سارة علي التميمي (البصرة)",
                "phone_number": "+9647805551234",
                "tags": ["عميل VIP", "البصرة - الجزائر"],
            }
        )
        ExternalIdentity.objects.get_or_create(
            tenant=clinic_tenant,
            contact=contact_sara,
            channel_type="whatsapp",
            defaults={"external_id": "+9647805551234"}
        )

        # 7. Inbox Conversations & Messages
        conv, _ = Conversation.objects.get_or_create(
            tenant=clinic_tenant,
            contact=contact_sara,
            channel_connection=whatsapp_conn,
            defaults={"status": "open"}
        )
        Message.objects.get_or_create(
            tenant=clinic_tenant,
            conversation=conv,
            text_content="السلام عليكم، أود حجز موعد فحص واستشارة لدى الدكتور أحمد في مركز البصرة الطبي ليوم غد؟",
            defaults={
                "direction": MessageDirection.INBOUND,
                "message_type": MessageType.TEXT,
                "delivery_status": DeliveryStatus.DELIVERED,
                "provider_message_id": "wamid_iq_demo_101",
            }
        )

        # 8. Services & Resources (Prices in Iraqi Dinar - IQD)
        service_consultation, _ = Service.objects.get_or_create(
            tenant=clinic_tenant,
            name="كشف واستشارة طبية تخصصية",
            defaults={"duration_minutes": 30, "price": 35000.00, "is_active": True}  # 35,000 د.ع
        )
        dr_ahmed, _ = Resource.objects.get_or_create(
            tenant=clinic_tenant,
            name="د. أحمد السعدون (استشاري)",
            defaults={"resource_type": ResourceType.STAFF, "is_active": True}
        )
        clinic_room, _ = Resource.objects.get_or_create(
            tenant=clinic_tenant,
            name="عيادة 1 - جناح البصرة",
            defaults={"resource_type": ResourceType.ROOM, "is_active": True}
        )

        # 9. Appointment
        appt_time = timezone.now() + timedelta(days=1, hours=2)
        appt, appt_created = Appointment.objects.get_or_create(
            tenant=clinic_tenant,
            service=service_consultation,
            contact=contact_sara,
            defaults={
                "start_time": appt_time,
                "end_time": appt_time + timedelta(minutes=30),
                "status": "confirmed",
                "notes": "حجز موعد مؤكد عبر محرك الأتمتة الموحد - البصرة",
            }
        )
        if appt_created:
            AppointmentResource.objects.create(tenant=clinic_tenant, appointment=appt, resource=dr_ahmed)
            AppointmentResource.objects.create(tenant=clinic_tenant, appointment=appt, resource=clinic_room)

        # 10. Visual Workflow (n8n-like Canvas)
        wf, _ = Workflow.objects.get_or_create(
            tenant=clinic_tenant,
            name="أتمتة حجز واستفسارات واتساب (العراق)",
            defaults={
                "trigger_type": TriggerType.MESSAGE_RECEIVED,
                "is_active": True,
                "description": "تدفق يستقبل رسائل الأرقام العراقية، يستخرج نية الحجز، يتحقق من التوافر ذرياً، ويؤكد الحجز.",
            }
        )
        WorkflowVersion.objects.get_or_create(
            tenant=clinic_tenant,
            workflow=wf,
            version_number=1,
            defaults={
                "is_published": True,
                "definition": {
                    "nodes": [
                        {"id": "node-1", "type": "trigger", "label": "استقبال رسالة واتساب (+964)"},
                        {"id": "node-2", "type": "ai", "label": "فهم الطلب واستخراج الموعد"},
                        {"id": "node-3", "type": "logic", "label": "فحص جدول د. أحمد السعدون ذرياً"},
                        {"id": "node-4", "type": "action", "label": "تأكيد الحجز وإرسال تفاصيل العيادة بالبصرة"},
                    ],
                    "edges": [
                        {"source": "node-1", "target": "node-2"},
                        {"source": "node-2", "target": "node-3"},
                        {"source": "node-3", "target": "node-4"},
                    ]
                }
            }
        )

        # 11. Knowledge Base Document (Iraq / Basra Clinic)
        doc, _ = KnowledgeDocument.objects.get_or_create(
            tenant=clinic_tenant,
            title="دليل خدمات مركز البصرة الطبي التخصصي وأوقات العمل 2026",
            defaults={
                "source_type": "text",
                "raw_content": "مركز البصرة الطبي التخصصي يقع في البصرة - منطقة الجزائر. يفتح يومياً من 9:00 صباحاً حتى 9:00 مساءً ما عدا الجمعة. أجور الاستشارة التخصصية 35,000 دينار عراقي.",
                "is_active": True,
            }
        )
        KnowledgeChunk.objects.get_or_create(
            tenant=clinic_tenant,
            document=doc,
            chunk_index=0,
            defaults={
                "content": "موقع المركز: البصرة - الجزائر. ساعات العمل: 9:00 ص - 9:00 م. أجور الفحص: 35,000 د.ع. أرقام الحجز: +964 780 123 4567.",
            }
        )

        self.stdout.write(self.style.SUCCESS("FlowDesk AI database successfully seeded for Iraq (Basra)!"))
