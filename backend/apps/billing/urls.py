from django.urls import path
from apps.billing.views import SubscriptionDetailView, UsageRecordListView

urlpatterns = [
    path("subscription/", SubscriptionDetailView.as_view(), name="billing-subscription"),
    path("usage/", UsageRecordListView.as_view(), name="billing-usage"),
]
