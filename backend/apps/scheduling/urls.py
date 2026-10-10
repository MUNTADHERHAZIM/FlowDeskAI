from django.urls import path
from apps.scheduling.views import (
    ServiceListCreateView,
    ResourceListCreateView,
    AppointmentListCreateView,
)

urlpatterns = [
    path("services/", ServiceListCreateView.as_view(), name="service-list"),
    path("resources/", ResourceListCreateView.as_view(), name="resource-list"),
    path("appointments/", AppointmentListCreateView.as_view(), name="appointment-list"),
]
