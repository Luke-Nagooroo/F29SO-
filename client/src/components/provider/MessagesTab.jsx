import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus } from "lucide-react";
import ConversationList from "../messages/ConversationList";
import MessageThread from "../messages/MessageThread";
import { messagesAPI, appointmentsAPI } from "../../api";
import { useSocket } from "../../context/SocketContext";

const MessagesTab = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showPatientsList, setShowPatientsList] = useState(false);

  const { data: conversationsData } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await messagesAPI.getConversations();
      return response.data.data;
    },
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const { data: patientsData } = useQuery({
    queryKey: ["providerPatients"],
    queryFn: async () => {
      const response = await appointmentsAPI.getProviderPatients();
      return response.data.data;
    },
  });

  const { data: messagesData } = useQuery({
    queryKey: ["messages", selectedConversation?.participant?._id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await messagesAPI.getMessages(
        selectedConversation.participant._id,
      );
      return response.data.data;
    },
    enabled: !!selectedConversation,
  });

  useEffect(() => {
    if (!socket || !selectedConversation?.conversationId) return;
    socket.emit("join-conversation", selectedConversation.conversationId);
    return () => {
      socket.emit("leave-conversation", selectedConversation.conversationId);
    };
  }, [socket, selectedConversation?.conversationId]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (selectedConversation?.participant?._id) {
        queryClient.invalidateQueries({
          queryKey: ["messages", selectedConversation.participant._id],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["unreadMessages"] });
    };
    socket.on("new-message", handleNewMessage);
    socket.on("messages-read", () =>
      queryClient.invalidateQueries({ queryKey: ["conversations"] }),
    );
    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("messages-read");
    };
  }, [socket, selectedConversation, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: (content) =>
      messagesAPI.send({
        recipientId: selectedConversation.participant._id,
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", selectedConversation?.participant?._id],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadMessages"] });
    },
  });

  const handleSendMessage = useCallback(
    (content) => {
      if (selectedConversation) sendMessageMutation.mutate(content);
    },
    [selectedConversation, sendMessageMutation],
  );

  const handleTyping = useCallback(() => {
    if (!socket || !selectedConversation) return;
    socket.emit("typing", {
      conversationId: selectedConversation.conversationId,
      recipientId: selectedConversation.participant._id,
    });
  }, [socket, selectedConversation]);

  const handleStopTyping = useCallback(() => {
    if (!socket || !selectedConversation) return;
    socket.emit("stop-typing", {
      conversationId: selectedConversation.conversationId,
      recipientId: selectedConversation.participant._id,
    });
  }, [socket, selectedConversation]);

  const handleStartConversation = (patient) => {
    setSelectedConversation({
      conversationId: null,
      participant: patient,
    });
    setShowPatientsList(false);
    queryClient.invalidateQueries({ queryKey: ["messages", patient._id] });
  };

  const participant = selectedConversation?.participant;
  const participantName = participant
    ? `${participant.profile?.firstName ?? ""} ${participant.profile?.lastName ?? ""}`.trim()
    : "";
  const participantInitials = participant
    ? `${participant.profile?.firstName?.[0] ?? ""}${participant.profile?.lastName?.[0] ?? ""}`.toUpperCase()
    : "";
  const participantRole =
    participant?.role === "provider"
      ? participant?.providerInfo?.specialization || "Healthcare Provider"
      : "Patient";

  return (
    <div className="bg-card border border-border rounded-2xl shadow-md h-[calc(100vh-16rem)] flex flex-col overflow-hidden theme-surface">
      {/* Top bar */}
      <div className="flex-none flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <h1 className="font-bold text-lg text-foreground">Messages</h1>
        <div className="flex-1" />
        <button
          onClick={() => setShowPatientsList((v) => !v)}
          className={`p-2 rounded-full transition-colors shrink-0 ${
            showPatientsList
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground"
          }`}
          aria-label="New message"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar — 320px */}
        <div className="w-80 flex-none border-r border-border flex flex-col min-h-0 bg-card">
          {showPatientsList ? (
            <div className="flex-1 overflow-y-auto">
              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border sticky top-0 bg-card z-10">
                Your Patients
              </p>
              {patientsData && patientsData.length > 0 ? (
                patientsData.map((patient) => (
                  <button
                    key={patient._id}
                    onClick={() => handleStartConversation(patient)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-muted/40 transition-colors text-left ${
                      selectedConversation?.participant?._id === patient._id
                        ? "bg-primary/10"
                        : ""
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
                      {patient.profile?.firstName?.[0]}
                      {patient.profile?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {patient.profile?.firstName} {patient.profile?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {patient.email}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex items-center justify-center p-8 text-muted-foreground text-sm text-center">
                  No patients yet. Patients appear here once they book an
                  appointment with you.
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <ConversationList
                conversations={conversationsData}
                selectedConversation={selectedConversation}
                onSelectConversation={(conv) => {
                  setSelectedConversation(conv);
                  setShowPatientsList(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Thread panel */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {selectedConversation ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-none">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
                  {participantInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {participantName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {participantRole}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                  aria-label="Close conversation"
                >
                  ×
                </button>
              </div>
              <MessageThread
                messages={messagesData}
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                onStopTyping={handleStopTyping}
                conversationId={selectedConversation?.conversationId}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 p-8">
              <MessageSquare className="w-14 h-14 opacity-20" />
              <p className="text-base text-center">
                {showPatientsList
                  ? "Select a patient to start messaging"
                  : "Select a conversation or create a new one"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesTab;
