from django.urls import path
from apps.channels.views import (
    ChannelConnectionListCreateView,
    ChannelConnectionDetailView,
    InboundWebhookReceiverView,
    PublicWebChatWebhookView,
)

urlpatterns = [
    path("", ChannelConnectionListCreateView.as_view(), name="channel-list-create"),
    path("webchat/webhook/", PublicWebChatWebhookView.as_view(), name="channel-webchat-webhook"),
    path("<uuid:pk>/", ChannelConnectionDetailView.as_view(), name="channel-detail"),
    path("<uuid:channel_id>/webhook/", InboundWebhookReceiverView.as_view(), name="channel-webhook"),
]
