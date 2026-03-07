import React, { useEffect, useMemo, useState } from "react";
import ConversationList from "../messages/ConversationList";
import MessageThread from "../messages/MessageThread";
import { messagesAPI } from "../../api";
import { useSocket } from "../../context/SocketContext";

const starterConversations = [
  {
    id: "conv-patient-1",
    name: "Ayesha Malik",
    roleLabel: "High blood pressure follow-up",
    participantId: "patient-1",
    lastMessage: "I uploaded my latest readings.",
    lastMessageAt: new Date().toISOString(),
  },
  {
    id: "conv-patient-2",
    name: "Hamza Tariq",
    roleLabel: "Post-visit check-in",
    participantId: "patient-2",
    lastMessage: "My headache is getting better now.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
];

const starterMessages = {
  "conv-patient-1": [
    {
      id: "p1",
      senderId: "patient-1",
      content: "I uploaded my latest readings.",
      createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    },
  ],
  "conv-patient-2": [
    {
      id: "p2",
      senderId: "patient-2",
      content: "My headache is getting better now.",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ],
};

const ProviderMessagesTab = () => {
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
                "Patient",
              roleLabel: item.participant?.role || "Patient",
              participantId: item.participant?._id || item.participantId,
              lastMessage: item.lastMessage?.content || item.lastMessage || "Open thread",
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
        title="Patient Messages"
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

export default ProviderMessagesTab;
