from django.urls import path
from apps.inbox.views import (
    ConversationListView,
    ConversationDetailView,
    MessageListCreateView,
)

urlpatterns = [
    path("conversations/", ConversationListView.as_view(), name="conversation-list"),
    path("conversations/<uuid:pk>/", ConversationDetailView.as_view(), name="conversation-detail"),
    path("conversations/<uuid:conversation_id>/messages/", MessageListCreateView.as_view(), name="conversation-messages"),
]
