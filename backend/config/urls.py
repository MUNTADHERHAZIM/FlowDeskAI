from pathlib import Path
from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse, JsonResponse
from django.views.generic import RedirectView
from django.views.static import serve
from django.conf import settings

FRONTEND_OUT_DIR = settings.BASE_DIR.parent / "frontend" / "out"

def health_check(request):
    return JsonResponse({"status": "ok", "app": "FlowDesk AI Core API", "version": "1.0.0"})

def serve_frontend(request, path=""):
    clean_path = path.strip("/")
    
    # 1. Exact file match (e.g. widget.js, favicon.ico)
    if clean_path:
        target_file = FRONTEND_OUT_DIR / clean_path
        if target_file.is_file():
            return serve(request, clean_path, document_root=str(FRONTEND_OUT_DIR))
        
        # 2. Sub-route with index.html (e.g. inbox -> inbox/index.html)
        dir_index = FRONTEND_OUT_DIR / clean_path / "index.html"
        if dir_index.is_file():
            with open(dir_index, "rb") as f:
                return HttpResponse(f.read(), content_type="text/html; charset=utf-8")
                
    # 3. Root index.html or SPA fallback
    root_index = FRONTEND_OUT_DIR / "index.html"
    if root_index.is_file():
        with open(root_index, "rb") as f:
            return HttpResponse(f.read(), content_type="text/html; charset=utf-8")
            
    return JsonResponse({
        "app": "FlowDesk AI - Core Backend API",
        "status": "online",
        "message": "خادم FlowDesk AI يعمل بنجاح. يرجى بناء الواجهة الأمامية ليتم عرضها.",
        "admin_portal": "/admin/",
    })

urlpatterns = [
    # Admin Portal
    path("admin", RedirectView.as_view(url="/admin/", permanent=False)),
    path("admin/", admin.site.urls),

    # Health check
    path("api/health/", health_check, name="health-check"),

    # REST APIs
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

    # Next.js static assets (_next/...)
    path("_next/<path:path>", serve, {"document_root": str(FRONTEND_OUT_DIR / "_next")}),

    # Frontend SPA Catch-all (Dashboard, Inbox, Contacts, Settings, Chat, etc.)
    re_path(r"^(?P<path>.*)$", serve_frontend, name="frontend-app"),
]
