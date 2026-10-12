from django.urls import path
from apps.contacts.views import (
    ContactListCreateView,
    ContactDetailView,
    ExternalIdentityListCreateView,
)

urlpatterns = [
    path("", ContactListCreateView.as_view(), name="contact-list-create"),
    path("<uuid:pk>/", ContactDetailView.as_view(), name="contact-detail"),
    path("<uuid:contact_id>/identities/", ExternalIdentityListCreateView.as_view(), name="contact-identities-list-create"),
]
