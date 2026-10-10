from django.urls import path
from rest_framework import generics, serializers
from apps.contacts.models import Contact
from apps.tenants.permissions import IsTenantMember

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ["id", "name", "email", "phone_number", "custom_attributes", "tags", "created_at"]
        read_only_fields = ["id", "created_at"]

class ContactListCreateView(generics.ListCreateAPIView):
    serializer_class = ContactSerializer
    permission_classes = [IsTenantMember]

    def get_queryset(self):
        return Contact.objects.filter(tenant=self.request.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant)

urlpatterns = [
    path("", ContactListCreateView.as_view(), name="contact-list-create"),
]
