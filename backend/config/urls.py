from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root_view(request):
    return JsonResponse({
        "app": "FlowDesk AI - Core Backend API",
        "status": "online",
        "version": "1.0.0",
        "message": "خادم FlowDesk AI يعمل بنجاح. الواجهة الأمامية للمنصة متاحة على http://localhost:3000",
        "frontend_url": "http://localhost:3000",
        "health_check": "/api/health/",
        "admin_portal": "/admin/",
    })

def health_check(request):
    return JsonResponse({"status": "ok", "app": "FlowDesk AI Core API", "version": "1.0.0"})

urlpatterns = [
    path("", root_view, name="api-root"),
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/v1/auth/", include("apps.identity.urls")),
    path("api/v1/tenants/", include("apps.tenants.urls")),
    path("api/v1/contacts/", include("apps.contacts.urls")),
    path("api/v1/inbox/", include("apps.inbox.urls")),
    path("api/v1/scheduling/", include("apps.scheduling.urls")),
    path("api/v1/workflows/", include("apps.workflows.urls")),
    path("api/v1/runtime/", include("apps.workflow_runtime.urls")),
    path("api/v1/ai/", include("apps.ai.urls")),
    path("api/v1/channels/", include("apps.channels.urls")),
    path("api/v1/billing/", include("apps.billing.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/audit/", include("apps.audit.urls")),
]
