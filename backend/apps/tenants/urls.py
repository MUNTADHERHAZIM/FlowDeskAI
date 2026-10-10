from django.urls import path
from apps.tenants.views import (
    TenantListCreateView,
    TenantDetailView,
    TenantMembersView,
    SetDefaultTenantView,
)

urlpatterns = [
    path("", TenantListCreateView.as_view(), name="tenant-list-create"),
    path("current/", TenantDetailView.as_view(), name="tenant-current"),
    path("current/members/", TenantMembersView.as_view(), name="tenant-members"),
    path("<uuid:tenant_id>/set-default/", SetDefaultTenantView.as_view(), name="tenant-set-default"),
]
