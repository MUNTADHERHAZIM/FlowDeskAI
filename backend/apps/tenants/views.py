from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.tenants.models import Tenant, Membership, MembershipRole
from apps.tenants.serializers import (
    TenantSerializer,
    CreateTenantSerializer,
    MembershipSerializer,
    InviteMemberSerializer,
)
from apps.tenants.permissions import IsTenantMember, IsTenantOwnerOrAdmin
from apps.identity.models import User


class TenantListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CreateTenantSerializer
        return TenantSerializer

    def get_queryset(self):
        return Tenant.objects.filter(memberships__user=self.request.user).distinct()


class TenantDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated, IsTenantMember, IsTenantOwnerOrAdmin]

    def get_object(self):
        return self.request.tenant


class TenantMembersView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsTenantMember]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return InviteMemberSerializer
        return MembershipSerializer

    def get_queryset(self):
        return Membership.objects.filter(tenant=self.request.tenant).select_related("user")

    def create(self, request, *args, **kwargs):
        if request.membership.role not in [MembershipRole.OWNER, MembershipRole.ADMIN]:
            return Response({"detail": "ليس لديك صلاحية لإضافة أعضاء جدد."}, status=status.HTTP_403_FORBIDDEN)

        serializer = InviteMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()
        role = serializer.validated_data["role"]

        user = User.objects.filter(email=email).first()
        if not user:
            # Create user placeholder with random password
            user = User.objects.create_user(email=email)

        membership, created = Membership.objects.get_or_create(
            tenant=request.tenant,
            user=user,
            defaults={"role": role}
        )
        if not created:
            membership.role = role
            membership.save()

        return Response(MembershipSerializer(membership).data, status=status.HTTP_201_CREATED)


class SetDefaultTenantView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, tenant_id):
        membership = get_object_or_404(Membership, user=request.user, tenant_id=tenant_id)
        Membership.objects.filter(user=request.user).update(is_default=False)
        membership.is_default = True
        membership.save(update_fields=["is_default"])
        return Response({"status": "success", "default_tenant": str(membership.tenant_id)})
