from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok", "app": "FlowDesk AI Core API", "version": "1.0.0"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/v1/auth/", include("apps.identity.urls")),
    path("api/v1/tenants/", include("apps.tenants.urls")),
    path("api/v1/contacts/", include("apps.contacts.urls")),
    path("api/v1/inbox/", include("apps.inbox.urls")),
    path("api/v1/scheduling/", include("apps.scheduling.urls")),
    path("api/v1/workflows/", include("apps.workflows.urls")),
    path("api/v1/ai/", include("apps.ai.urls")),
]
