from django.urls import path
from apps.channels.views import (
    ChannelConnectionListCreateView,
    ChannelConnectionDetailView,
    InboundWebhookReceiverView,
    PublicWebChatWebhookView,
    TelegramBotSetupView,
)

urlpatterns = [
    path("", ChannelConnectionListCreateView.as_view(), name="channel-list-create"),
    path("webchat/webhook/", PublicWebChatWebhookView.as_view(), name="channel-webchat-webhook"),
    path("telegram/setup/", TelegramBotSetupView.as_view(), name="channel-telegram-setup"),
    path("<uuid:pk>/", ChannelConnectionDetailView.as_view(), name="channel-detail"),
    path("<uuid:channel_id>/webhook/", InboundWebhookReceiverView.as_view(), name="channel-webhook"),
]
