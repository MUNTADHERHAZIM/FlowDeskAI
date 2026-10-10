from django.urls import path
from apps.workflows.views import WorkflowListCreateView, WorkflowDetailView

urlpatterns = [
    path("", WorkflowListCreateView.as_view(), name="workflow-list-create"),
    path("<uuid:pk>/", WorkflowDetailView.as_view(), name="workflow-detail"),
]
