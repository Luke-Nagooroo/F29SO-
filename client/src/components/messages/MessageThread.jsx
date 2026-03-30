import React, { useRef, useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
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
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for typing events
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
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
      if (onStopTyping) onStopTyping();
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatMessageTime = (date) => {
    try {
      return format(new Date(date), "MMM dd, hh:mm a");
    } catch (e) {
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
                className="max-w-[200px] rounded-md cursor-pointer"
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
              📎 {att.originalName || "Download file"}
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((message) => {
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
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/55 text-foreground border border-border"
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1">
                      {sender?.profile?.firstName} {sender?.profile?.lastName}
                    </p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  {renderAttachments(message.attachments)}
                  <p
                    className={`text-xs mt-1 ${
                      isOwn
                        ? "text-primary-foreground/75"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                    {isOwn && message.isRead && (
                      <span className="ml-2">✓✓</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        )}
        {typingUser && (
          <div className="flex justify-start">
            <div className="bg-secondary/55 text-muted-foreground border border-border rounded-lg px-4 py-2 text-sm italic">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4 bg-card">
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn btn-primary"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageThread;
