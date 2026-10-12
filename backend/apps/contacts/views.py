from rest_framework import generics, permissions
from django.db.models import Q
from apps.contacts.models import Contact, ExternalIdentity
from apps.contacts.serializers import ContactSerializer, ExternalIdentitySerializer
from apps.tenants.permissions import IsTenantMember


class ContactListCreateView(generics.ListCreateAPIView):
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        qs = Contact.objects.filter(tenant=self.request.tenant).prefetch_related(
            "external_identities", "consents"
        )
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(
                Q(name__icontains=q)
                | Q(phone_number__icontains=q)
                | Q(email__icontains=q)
            )
        return qs

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant)


class ContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return Contact.objects.filter(tenant=self.request.tenant).prefetch_related(
            "external_identities", "consents"
        )


class ExternalIdentityListCreateView(generics.ListCreateAPIView):
    serializer_class = ExternalIdentitySerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        contact_id = self.kwargs.get("contact_id")
        return ExternalIdentity.objects.filter(
            tenant=self.request.tenant, contact_id=contact_id
        )

    def perform_create(self, serializer):
        contact = generics.get_object_or_404(
            Contact, id=self.kwargs.get("contact_id"), tenant=self.request.tenant
        )
        serializer.save(tenant=self.request.tenant, contact=contact)
