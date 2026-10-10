from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import transaction
from apps.identity.models import User
from apps.tenants.models import Tenant, Membership, MembershipRole


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    organization_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "email", "password", "first_name", "last_name", "phone_number", "organization_name"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        org_name = validated_data.pop("organization_name", None)
        password = validated_data.pop("password")

        with transaction.atomic():
            user = User.objects.create_user(password=password, **validated_data)

            # Auto-create organization if provided or default one
            initial_org_name = org_name or f"مؤسسة {user.first_name or user.email.split('@')[0]}"
            tenant = Tenant.objects.create(name=initial_org_name)
            Membership.objects.create(
                tenant=tenant,
                user=user,
                role=MembershipRole.OWNER,
                is_default=True,
            )

        return user


class UserSerializer(serializers.ModelSerializer):
    tenants = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "phone_number", "date_joined", "tenants"]
        read_only_fields = ["id", "date_joined", "tenants"]

    def get_tenants(self, obj):
        memberships = obj.memberships.select_related("tenant").all()
        return [
            {
                "id": str(m.tenant.id),
                "name": m.tenant.name,
                "slug": m.tenant.slug,
                "role": m.role,
                "is_default": m.is_default,
            }
            for m in memberships
        ]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user_serializer = UserSerializer(self.user)
        data["user"] = user_serializer.data
        return data
