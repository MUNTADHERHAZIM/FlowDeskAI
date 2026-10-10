import pytest
from rest_framework.test import APIClient
from apps.identity.models import User
from apps.tenants.models import Tenant, Membership, MembershipRole


@pytest.mark.django_db
def test_user_registration_creates_tenant_and_owner_membership():
    client = APIClient()
    payload = {
        "email": "owner@flowdesk.test",
        "password": "Password123!",
        "first_name": "أحمد",
        "last_name": "المطوع",
        "organization_name": "عيادة النخبة الطبية",
    }
    response = client.post("/api/v1/auth/register/", payload, format="json")
    assert response.status_code == 201

    # Check user was created
    user = User.objects.get(email="owner@flowdesk.test")
    assert user.first_name == "أحمد"

    # Check Tenant was created
    tenant = Tenant.objects.get(name="عيادة النخبة الطبية")
    assert tenant is not None

    # Check Membership was created with OWNER role and is_default
    membership = Membership.objects.get(user=user, tenant=tenant)
    assert membership.role == MembershipRole.OWNER
    assert membership.is_default is True


@pytest.mark.django_db
def test_user_login_returns_jwt_tokens_and_user_tenants():
    # Register first
    user = User.objects.create_user(email="test@flowdesk.test", password="SecretPassword123!")
    tenant = Tenant.objects.create(name="مكتب العدالة للمحاماة")
    Membership.objects.create(user=user, tenant=tenant, role=MembershipRole.OWNER, is_default=True)

    client = APIClient()
    response = client.post("/api/v1/auth/login/", {"email": "test@flowdesk.test", "password": "SecretPassword123!"}, format="json")
    assert response.status_code == 200
    data = response.json()
    assert "access" in data
    assert "refresh" in data
    assert "user" in data
    assert len(data["user"]["tenants"]) == 1
    assert data["user"]["tenants"][0]["name"] == "مكتب العدالة للمحاماة"


@pytest.mark.django_db
def test_tenant_isolation_denies_unauthorized_tenant_access():
    user1 = User.objects.create_user(email="user1@flowdesk.test", password="Password123!")
    tenant1 = Tenant.objects.create(name="مؤسسة أ")
    Membership.objects.create(user=user1, tenant=tenant1, role=MembershipRole.OWNER, is_default=True)

    user2 = User.objects.create_user(email="user2@flowdesk.test", password="Password123!")
    tenant2 = Tenant.objects.create(name="مؤسسة ب")
    Membership.objects.create(user=user2, tenant=tenant2, role=MembershipRole.OWNER, is_default=True)

    client = APIClient()
    client.force_authenticate(user=user1)

    # user1 attempts to access tenant2 via X-Tenant-ID header
    response = client.get("/api/v1/inbox/conversations/", HTTP_X_TENANT_ID=str(tenant2.id))
    assert response.status_code == 403
    assert "يجب أن تكون عضوًا مصرحًا" in response.json()["detail"] or "Tenant Access Denied" in response.json()["detail"]
