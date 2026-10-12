from django.urls import path
from apps.notifications.views import (
    NotificationListView,
    NotificationMarkReadView,
    ReminderListCreateView,
)

urlpatterns = [
    path("", NotificationListView.as_view(), name="notification-list"),
    path("read/", NotificationMarkReadView.as_view(), name="notification-mark-all-read"),
    path("<uuid:pk>/read/", NotificationMarkReadView.as_view(), name="notification-mark-read"),
    path("reminders/", ReminderListCreateView.as_view(), name="reminder-list-create"),
]
