import React, { useRef, useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

const MessageThread = ({
  messages,
  onSendMessage,
  onTyping,
  onStopTyping,
  conversationId,
}) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [typingUser, setTypingUser] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ userId: uid, conversationId: cid }) => {
      if (cid === conversationId && uid !== user?._id) setTypingUser(uid);
    };

    const handleStopTyping = ({ userId: uid, conversationId: cid }) => {
      if (cid === conversationId && uid !== user?._id) setTypingUser(null);
    };

    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
    };
  }, [socket, conversationId, user?._id]);

  const handleInputChange = useCallback(
    (e) => {
      setNewMessage(e.target.value);
      if (onTyping) onTyping();
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (onStopTyping) onStopTyping();
      }, 2000);
    },
    [onTyping, onStopTyping],
  );

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    onSendMessage(newMessage.trim());
    setNewMessage("");
    if (onStopTyping) onStopTyping();
    clearTimeout(typingTimeoutRef.current);
  };

  const formatMessageTime = (date) => {
    try {
      return format(new Date(date), "MMM dd, hh:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const renderAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) return null;

    const baseUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";

    return (
      <div className="mt-2 space-y-1">
        {attachments.map((att, i) => {
          const url = `${baseUrl}${att.url}`;

          if (att.type === "image") {
            return (
              <img
                key={i}
                src={url}
                alt="attachment"
                className="max-w-[200px] cursor-pointer rounded-md"
                onClick={() => window.open(url, "_blank")}
              />
            );
          }

          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs underline"
            >
              Attachment: {att.originalName || "Download file"}
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-5">
        {messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn =
                message.senderId?._id === user?._id ||
                message.sender?._id === user?._id;
              const sender = message.senderId || message.sender;

              return (
                <div
                  key={message._id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[22px] px-4 py-3 shadow-sm sm:max-w-[72%] ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-secondary/55 text-foreground"
                    }`}
                  >
                    {!isOwn && (
                      <p className="mb-1 text-xs font-semibold">
                        {sender?.profile?.firstName} {sender?.profile?.lastName}
                      </p>
                    )}
                    <p className="break-words text-sm leading-6">
                      {message.content}
                    </p>
                    {renderAttachments(message.attachments)}
                    <p
                      className={`mt-2 text-xs ${
                        isOwn
                          ? "text-primary-foreground/75"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatMessageTime(message.createdAt)}
                      {isOwn && message.isRead && (
                        <span className="ml-2">Read</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        )}

        {typingUser && (
          <div className="mt-4 flex justify-start">
            <div className="rounded-[22px] border border-border bg-secondary/55 px-4 py-2 text-sm italic text-muted-foreground">
              Typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="min-w-0 flex-1 rounded-full border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="shrink-0 rounded-full px-5"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MessageThread;
