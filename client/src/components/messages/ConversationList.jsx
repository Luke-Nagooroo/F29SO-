import React from "react";
import { format } from "date-fns";

const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  className = "",
}) => {
  const formatLastMessageTime = (date) => {
    try {
      const messageDate = new Date(date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (messageDate.toDateString() === today.toDateString()) {
        return format(messageDate, "hh:mm a");
      } else if (messageDate.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return format(messageDate, "MMM dd");
      }
    } catch (e) {
      return "";
    }
  };

  return (
    <div className={className}>
      {conversations && conversations.length > 0 ? (
        conversations.map((conversation) => {
          const otherUser = conversation.participant;
          const isSelected =
            selectedConversation?.conversationId === conversation.conversationId;

          return (
            <button
              key={conversation.conversationId}
              onClick={() => onSelectConversation(conversation)}
              type="button"
              className={`flex w-full items-start gap-3 border-b border-border px-4 py-4 text-left hover:bg-secondary/30 transition-colors ${
                isSelected ? "bg-primary/15" : ""
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shrink-0">
                {otherUser?.profile?.firstName?.[0]}
                {otherUser?.profile?.lastName?.[0]}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {otherUser?.profile?.firstName}{" "}
                      {otherUser?.profile?.lastName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {otherUser?.role === "provider"
                        ? otherUser?.profile?.specialization ||
                          "Healthcare Provider"
                        : "Patient"}
                    </p>
                  </div>
                  {conversation.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {formatLastMessageTime(
                        conversation.lastMessage.createdAt,
                      )}
                    </span>
                  )}
                </div>

                {conversation.lastMessage && (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                      {conversation.lastMessage.content}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
          No conversations yet. Start by booking an appointment with a
          healthcare provider.
        </div>
      )}
    </div>
  );
};

export default ConversationList;
