from rest_framework import serializers
from apps.contacts.models import Contact, ExternalIdentity, ConsentRecord


class ExternalIdentitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalIdentity
        fields = ["id", "channel_type", "external_id", "metadata", "created_at"]
        read_only_fields = ["id", "created_at"]


class ConsentRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsentRecord
        fields = ["id", "channel_type", "granted", "opt_in_timestamp"]
        read_only_fields = ["id", "opt_in_timestamp"]


class ContactSerializer(serializers.ModelSerializer):
    external_identities = ExternalIdentitySerializer(many=True, read_only=True)
    consents = ConsentRecordSerializer(many=True, read_only=True)

    class Meta:
        model = Contact
        fields = [
            "id",
            "name",
            "email",
            "phone_number",
            "custom_attributes",
            "tags",
            "external_identities",
            "consents",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
