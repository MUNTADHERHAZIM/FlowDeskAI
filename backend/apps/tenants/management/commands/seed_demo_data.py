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
    help = "Seeds initial demo data for FlowDesk AI multi-tenant platform"

    def handle(self, *args, **options):
        self.stdout.write("Beggining database seeding for FlowDesk AI...")

        # 1. Create Superuser / Admin
        admin_user, created = User.objects.get_or_create(
            email="admin@flowdesk.ai",
            defaults={
                "first_name": "عبدالرحمن",
                "last_name": "الغامدي",
                "is_staff": True,
                "is_superuser": True,
            }
        )
        if created:
            admin_user.set_password("AdminPass123!")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user: admin@flowdesk.ai"))

        # 2. Create Tenant: عيادة النخبة الطبية
        clinic_tenant, _ = Tenant.objects.get_or_create(
            slug="elite-clinic",
            defaults={
                "name": "عيادة النخبة الطبية",
                "timezone": "Asia/Riyadh",
                "status": "active",
            }
        )

        # 3. Create Tenant: مجموعة العدالة للمحاماة
        law_tenant, _ = Tenant.objects.get_or_create(
            slug="justice-law",
            defaults={
                "name": "مجموعة العدالة القانونية",
                "timezone": "Asia/Riyadh",
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

        # 5. Omnichannel Connections
        whatsapp_conn, _ = ChannelConnection.objects.get_or_create(
            tenant=clinic_tenant,
            channel_type=ChannelType.WHATSAPP,
            defaults={
                "name": "رقم واتساب العيادة الرسمي",
                "is_active": True,
                "webhook_secret": "whsec_flowdesk_whatsapp_demo_2026",
            }
        )
        telegram_conn, _ = ChannelConnection.objects.get_or_create(
            tenant=clinic_tenant,
            channel_type=ChannelType.TELEGRAM,
            defaults={
                "name": "بوت تيليجرام حجز العيادة",
                "is_active": True,
            }
        )

        # 6. Contacts
        contact_sara, _ = Contact.objects.get_or_create(
            tenant=clinic_tenant,
            email="sara.m@example.com",
            defaults={
                "name": "سارة عبدالله المنصور",
                "phone_number": "+966501234567",
                "tags": ["عميل VIP", "أسنان"],
            }
        )
        ExternalIdentity.objects.get_or_create(
            tenant=clinic_tenant,
            contact=contact_sara,
            channel_type="whatsapp",
            defaults={"external_id": "+966501234567"}
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
            text_content="مرحباً بكم، أود الاستفسار عن المواعيد المتاحة لدى د. خالد السالم ليوم الثلاثاء القادم في الفترة الصباحية؟",
            defaults={
                "direction": MessageDirection.INBOUND,
                "message_type": MessageType.TEXT,
                "delivery_status": DeliveryStatus.DELIVERED,
                "provider_message_id": "wamid_demo_101",
            }
        )

        # 8. Services & Resources
        service_consultation, _ = Service.objects.get_or_create(
            tenant=clinic_tenant,
            name="استشارة طبية أولية",
            defaults={"duration_minutes": 30, "price": 250.00, "is_active": True}
        )
        dr_khaled, _ = Resource.objects.get_or_create(
            tenant=clinic_tenant,
            name="د. خالد السالم",
            defaults={"resource_type": ResourceType.STAFF, "is_active": True}
        )
        clinic_room, _ = Resource.objects.get_or_create(
            tenant=clinic_tenant,
            name="عيادة 2 - الدور الأرضي",
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
                "notes": "تم الحجز تلقائياً عبر محرك الأتمتة الموحد",
            }
        )
        if appt_created:
            AppointmentResource.objects.create(tenant=clinic_tenant, appointment=appt, resource=dr_khaled)
            AppointmentResource.objects.create(tenant=clinic_tenant, appointment=appt, resource=clinic_room)

        # 10. Visual Workflow
        wf, _ = Workflow.objects.get_or_create(
            tenant=clinic_tenant,
            name="أتمتة حجز المواعيد عبر واتساب والذكاء الاصطناعي",
            defaults={
                "trigger_type": TriggerType.MESSAGE_RECEIVED,
                "is_active": True,
                "description": "تدفق يستقبل رسالة العميل، يستخرج نية الحجز، يتحقق من التوافر ذرياً، ويؤكد الحجز.",
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
                        {"id": "node-1", "type": "trigger", "label": "استلام رسالة واتساب"},
                        {"id": "node-2", "type": "ai", "label": "استخراج موعد وخدمة بالـ AI"},
                        {"id": "node-3", "type": "logic", "label": "فحص التوافر الذري في التقويم"},
                        {"id": "node-4", "type": "action", "label": "تأكيد الحجز وإرسال رد العميل"},
                    ],
                    "edges": [
                        {"source": "node-1", "target": "node-2"},
                        {"source": "node-2", "target": "node-3"},
                        {"source": "node-3", "target": "node-4"},
                    ]
                }
            }
        )

        # 11. Knowledge Base Document
        doc, _ = KnowledgeDocument.objects.get_or_create(
            tenant=clinic_tenant,
            title="دليل خدمات العيادة وأوقات العمل الرسمية 2026",
            defaults={
                "source_type": "text",
                "raw_content": "تعمل عيادة النخبة الطبية يومياً من 9:00 ص حتى 9:00 م عدا الجمعة. الاستشارات الأولية مدتها 30 دقيقة ورسومها 250 ريال.",
                "is_active": True,
            }
        )
        KnowledgeChunk.objects.get_or_create(
            tenant=clinic_tenant,
            document=doc,
            chunk_index=0,
            defaults={
                "content": "مواعيد عمل عيادة النخبة: السبت إلى الخميس 9 ص - 9 م. الجمعة مغلق. رسوم الاستشارة 250 ريال.",
            }
        )

        self.stdout.write(self.style.SUCCESS("FlowDesk AI demo database successfully seeded!"))
