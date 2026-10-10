from django.http import JsonResponse
from apps.tenants.models import Tenant, Membership


class TenantMiddleware:
    """
    Middleware that inspects incoming requests and determines the active Tenant.
    Enforces isolation by verifying the authenticated user is an active member of that tenant.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.tenant = None
        request.membership = None

        tenant_id = request.headers.get("X-Tenant-ID") or request.GET.get("tenant_id")

        if request.user and request.user.is_authenticated:
            if tenant_id:
                try:
                    membership = Membership.objects.select_related("tenant").get(
                        user=request.user,
                        tenant__id=tenant_id
                    )
                    request.tenant = membership.tenant
                    request.membership = membership
                except (Membership.DoesNotExist, ValueError):
                    # Request specified a tenant the user has no access to
                    if request.path.startswith("/api/v1/") and not request.path.startswith("/api/v1/auth/") and not request.path.startswith("/api/v1/tenants/"):
                        return JsonResponse(
                            {"detail": "ليس لديك صلاحية وصول إلى هذه المؤسسة (Tenant Access Denied)."},
                            status=403
                        )
            else:
                # Fallback to user's default membership or first membership
                membership = (
                    Membership.objects.select_related("tenant")
                    .filter(user=request.user)
                    .order_by("-is_default", "-created_at")
                    .first()
                )
                if membership:
                    request.tenant = membership.tenant
                    request.membership = membership

        response = self.get_response(request)
        return response
