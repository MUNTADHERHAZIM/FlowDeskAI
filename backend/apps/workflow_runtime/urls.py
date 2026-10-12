from django.urls import path
from apps.workflow_runtime.views import WorkflowRunListView, WorkflowRunDetailView

urlpatterns = [
    path("runs/", WorkflowRunListView.as_view(), name="workflow-run-list-create"),
    path("runs/<uuid:pk>/", WorkflowRunDetailView.as_view(), name="workflow-run-detail"),
]
