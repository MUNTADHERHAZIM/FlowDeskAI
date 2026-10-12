from django.urls import path
from apps.scheduling.views import (
    ServiceListCreateView,
    ServiceDetailView,
    ResourceListCreateView,
    ResourceDetailView,
    AppointmentListCreateView,
    AppointmentDetailView,
    AvailabilityCheckView,
)

urlpatterns = [
    path("services/", ServiceListCreateView.as_view(), name="service-list"),
    path("services/<uuid:pk>/", ServiceDetailView.as_view(), name="service-detail"),
    path("resources/", ResourceListCreateView.as_view(), name="resource-list"),
    path("resources/<uuid:pk>/", ResourceDetailView.as_view(), name="resource-detail"),
    path("appointments/", AppointmentListCreateView.as_view(), name="appointment-list"),
    path("appointments/<uuid:pk>/", AppointmentDetailView.as_view(), name="appointment-detail"),
    path("availability/", AvailabilityCheckView.as_view(), name="availability-check"),
]
