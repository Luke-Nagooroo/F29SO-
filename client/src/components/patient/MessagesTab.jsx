import React, { useEffect, useMemo, useState } from "react";
import ConversationList from "../messages/ConversationList";
import MessageThread from "../messages/MessageThread";
import { messagesAPI } from "../../api";
import { useSocket } from "../../context/SocketContext";

const starterConversations = [
  {
    id: "conv-doc-1",
    name: "Dr. Sarah Ahmed",
    roleLabel: "Cardiology",
    participantId: "provider-1",
    lastMessage: "Please keep tracking your blood pressure this week.",
    lastMessageAt: new Date().toISOString(),
  },
  {
    id: "conv-doc-2",
    name: "Dr. Imran Khan",
    roleLabel: "General Physician",
    participantId: "provider-2",
    lastMessage: "How have your energy levels been?",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

const starterMessages = {
  "conv-doc-1": [
    {
      id: "m1",
      senderId: "provider-1",
      content: "Please keep tracking your blood pressure this week.",
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
  ],
  "conv-doc-2": [
    {
      id: "m2",
      senderId: "provider-2",
      content: "How have your energy levels been?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    },
  ],
};

const PatientMessagesTab = () => {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState(starterConversations);
  const [selectedConversation, setSelectedConversation] = useState(starterConversations[0]);
  const [threads, setThreads] = useState(starterMessages);

  useEffect(() => {
    let cancelled = false;

    const loadConversations = async () => {
      try {
        const response = await messagesAPI.getConversations();
        const data = response?.data?.data;
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setConversations(
            data.map((item, index) => ({
              id: item.conversationId || item.id || `conversation-${index}`,
              name:
                item.participant?.name ||
                [item.participant?.profile?.firstName, item.participant?.profile?.lastName]
                  .filter(Boolean)
                  .join(" ") ||
                "Care Provider",
              roleLabel: item.participant?.role || "Provider",
              participantId: item.participant?._id || item.participantId,
              lastMessage: item.lastMessage?.content || item.lastMessage || "Start chatting",
              lastMessageAt: item.lastMessage?.createdAt || item.updatedAt || new Date().toISOString(),
            })),
          );
        }
      } catch (error) {
        // Early-stage UI falls back to local sample data if backend is not ready.
      }
    };

    loadConversations();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!socket || !selectedConversation?.id) return;

    socket.emit("join-conversation", selectedConversation.id);
    return () => {
      socket.emit("leave-conversation", selectedConversation.id);
    };
  }, [socket, selectedConversation?.id]);

  const activeMessages = useMemo(
    () => threads[selectedConversation?.id] || [],
    [threads, selectedConversation?.id],
  );

  const handleSendMessage = (content) => {
    if (!selectedConversation) return;

    const nextMessage = {
      id: `local-${Date.now()}`,
      senderId: "me",
      content,
      createdAt: new Date().toISOString(),
    };

    setThreads((prev) => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), nextMessage],
    }));

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              lastMessage: content,
              lastMessageAt: nextMessage.createdAt,
            }
          : conversation,
      ),
    );

    socket?.emit("new-message", {
      conversationId: selectedConversation.id,
      content,
      receiverId: selectedConversation.participantId,
    });

    messagesAPI.send({
      receiverId: selectedConversation.participantId,
      content,
      conversationId: selectedConversation.id,
    }).catch(() => {});
  };

  return (
    <div className="grid h-[70vh] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <ConversationList
        title="Care Team Messages"
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
      />

      <MessageThread
        conversation={selectedConversation}
        messages={activeMessages}
        onSendMessage={handleSendMessage}
        currentUserId="me"
      />
    </div>
  );
};

export default PatientMessagesTab;
