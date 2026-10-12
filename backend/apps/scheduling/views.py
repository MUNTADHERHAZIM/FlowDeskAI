from datetime import timedelta
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from apps.scheduling.models import Service, Resource, Appointment, AppointmentStatus
from apps.scheduling.serializers import (
    ServiceSerializer,
    ResourceSerializer,
    AppointmentSerializer,
    CheckAvailabilitySerializer,
)
from apps.scheduling.services import SchedulingService, DoubleBookingConflictError
from apps.tenants.permissions import IsTenantMember


class ServiceListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return Service.objects.filter(tenant=self.request.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant)


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return Service.objects.filter(tenant=self.request.tenant)


class ResourceListCreateView(generics.ListCreateAPIView):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return Resource.objects.filter(tenant=self.request.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant)


class ResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return Resource.objects.filter(tenant=self.request.tenant)


class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return (
            Appointment.objects.filter(tenant=self.request.tenant)
            .select_related("service", "contact")
            .prefetch_related("appointment_resources__resource")
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = serializer.validated_data["service"]
        contact = serializer.validated_data["contact"]
        start_time = serializer.validated_data["start_time"]
        resource_ids = serializer.validated_data.get("resource_ids", [])
        notes = serializer.validated_data.get("notes", "")

        # If resource_ids are provided, book via the atomic SchedulingService with select_for_update
        if resource_ids:
            scheduler = SchedulingService(tenant=request.tenant)
            try:
                appointment = scheduler.book_appointment(
                    service=service,
                    contact=contact,
                    start_time=start_time,
                    resource_ids=[str(rid) for rid in resource_ids],
                    notes=notes,
                )
                output_serializer = AppointmentSerializer(appointment)
                return Response(output_serializer.data, status=status.HTTP_201_CREATED)
            except DoubleBookingConflictError as exc:
                return Response(
                    {"detail": str(exc), "code": "DOUBLE_BOOKING_CONFLICT"},
                    status=status.HTTP_409_CONFLICT,
                )
            except ValueError as exc:
                return Response(
                    {"detail": str(exc), "code": "INVALID_RESOURCE"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Standard booking when no specific physical resources are locked
        duration = service.duration_minutes
        end_time = start_time + timedelta(minutes=duration)
        appointment = serializer.save(tenant=request.tenant, end_time=end_time)
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        return (
            Appointment.objects.filter(tenant=self.request.tenant)
            .select_related("service", "contact")
            .prefetch_related("appointment_resources__resource")
        )


class AvailabilityCheckView(APIView):
    """
    Endpoint to check atomic availability across resources before scheduling.
    """
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]

    def post(self, request):
        serializer = CheckAvailabilitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        resource_ids = [str(r) for r in serializer.validated_data["resource_ids"]]
        start_time = serializer.validated_data["start_time"]
        duration = serializer.validated_data["duration_minutes"]
        end_time = start_time + timedelta(minutes=duration)

        scheduler = SchedulingService(tenant=request.tenant)
        is_free = scheduler.check_availability(
            resource_ids=resource_ids,
            start_time=start_time,
            end_time=end_time,
        )

        return Response({
            "is_available": is_free,
            "start_time": start_time,
            "end_time": end_time,
            "resource_ids": resource_ids,
        })
