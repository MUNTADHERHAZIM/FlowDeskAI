from django.urls import path
from rest_framework import generics, serializers
from apps.ai.models import KnowledgeDocument
from apps.tenants.permissions import IsTenantMember

class KnowledgeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeDocument
        fields = ["id", "title", "source_type", "raw_content", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]

class KnowledgeDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = KnowledgeDocumentSerializer
    permission_classes = [IsTenantMember]

    def get_queryset(self):
        return KnowledgeDocument.objects.filter(tenant=self.request.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant)

urlpatterns = [
    path("documents/", KnowledgeDocumentListCreateView.as_view(), name="knowledge-doc-list"),
]
