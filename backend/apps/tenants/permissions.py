from rest_framework import permissions
from apps.tenants.models import Membership, MembershipRole


def resolve_tenant_for_request(request):
    """
    Ensures request.tenant and request.membership are resolved even if
    authentication occurred inside DRF (e.g. JWTAuthentication or force_authenticate)
    after Django's standard middleware had already run.
    """
    if getattr(request, "tenant", None) and getattr(request, "membership", None):
        return True

    if not (request.user and request.user.is_authenticated):
        return False

    tenant_id = request.headers.get("X-Tenant-ID") or request.query_params.get("tenant_id")
    if tenant_id:
        try:
            membership = Membership.objects.select_related("tenant").get(
                user=request.user,
                tenant__id=tenant_id
            )
            request.tenant = membership.tenant
            request.membership = membership
            return True
        except (Membership.DoesNotExist, ValueError):
            return False
    else:
        membership = (
            Membership.objects.select_related("tenant")
            .filter(user=request.user)
            .order_by("-is_default", "-created_at")
            .first()
        )
        if membership:
            request.tenant = membership.tenant
            request.membership = membership
            return True

    return False


class IsTenantMember(permissions.BasePermission):
    """
    Allows access only to users who are active members of the current resolved tenant.
    """
    message = "يجب أن تكون عضوًا مصرحًا في المؤسسة للوصول إلى هذا المورد."

    def has_permission(self, request, view):
        resolve_tenant_for_request(request)
        return bool(request.user and request.user.is_authenticated and request.tenant and request.membership)


class IsTenantOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access only to tenant owners or administrators.
    """
    message = "هذا الإجراء متاح لمالك المؤسسة أو مديري النظام فقط."

    def has_permission(self, request, view):
        resolve_tenant_for_request(request)
        if not (request.user and request.user.is_authenticated and request.tenant and request.membership):
            return False
        return request.membership.role in (MembershipRole.OWNER, MembershipRole.ADMIN)


class IsTenantOwner(permissions.BasePermission):
    """
    Allows access strictly to the tenant owner.
    """
    message = "هذا الإجراء يتطلب صلاحيات مالك المؤسسة فقط."

    def has_permission(self, request, view):
        resolve_tenant_for_request(request)
        if not (request.user and request.user.is_authenticated and request.tenant and request.membership):
            return False
        return request.membership.role == MembershipRole.OWNER
