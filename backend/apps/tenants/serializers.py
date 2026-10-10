from rest_framework import serializers
from django.db import transaction
from apps.tenants.models import Tenant, Membership, MembershipRole
from apps.identity.models import User


class TenantSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = ["id", "name", "slug", "status", "timezone", "settings", "created_at", "role"]
        read_only_fields = ["id", "slug", "status", "created_at", "role"]

    def get_role(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            membership = obj.memberships.filter(user=request.user).first()
            if membership:
                return membership.role
        return None


class CreateTenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ["id", "name", "slug", "timezone", "status"]
        read_only_fields = ["id", "slug", "status"]

    def create(self, validated_data):
        user = self.context["request"].user
        with transaction.atomic():
            tenant = Tenant.objects.create(**validated_data)
            # Make first tenant default
            has_other_default = Membership.objects.filter(user=user, is_default=True).exists()
            Membership.objects.create(
                tenant=tenant,
                user=user,
                role=MembershipRole.OWNER,
                is_default=not has_other_default,
            )
        return tenant


class MemberUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "phone_number"]


class MembershipSerializer(serializers.ModelSerializer):
    user = MemberUserSerializer(read_only=True)
    tenant_name = serializers.ReadOnlyField(source="tenant.name")

    class Meta:
        model = Membership
        fields = ["id", "tenant", "tenant_name", "user", "role", "is_default", "created_at"]
        read_only_fields = ["id", "tenant", "tenant_name", "created_at"]


class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=MembershipRole.choices, default=MembershipRole.MEMBER)
