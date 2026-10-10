from rest_framework import permissions
from apps.tenants.models import MembershipRole


class IsTenantMember(permissions.BasePermission):
    """
    Allows access only to users who are active members of the current resolved tenant.
    """
    message = "يجب أن تكون عضوًا مصرحًا في المؤسسة للوصول إلى هذا المورد."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.tenant and request.membership)


class IsTenantOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access only to tenant owners or administrators.
    """
    message = "هذا الإجراء متاح لمالك المؤسسة أو مديري النظام فقط."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.tenant and request.membership):
            return False
        return request.membership.role in (MembershipRole.OWNER, MembershipRole.ADMIN)


class IsTenantOwner(permissions.BasePermission):
    """
    Allows access strictly to the tenant owner.
    """
    message = "هذا الإجراء يتطلب صلاحيات مالك المؤسسة فقط."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.tenant and request.membership):
            return False
        return request.membership.role == MembershipRole.OWNER
