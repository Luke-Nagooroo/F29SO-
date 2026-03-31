import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquareText, Plus } from "lucide-react";
import ConversationList from "../messages/ConversationList";
import MessageThread from "../messages/MessageThread";
import { messagesAPI, authAPI } from "../../api";
import { useSocket } from "../../context/SocketContext";
import { Button } from "@/components/ui/button";

const MessagesTab = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showDoctorsList, setShowDoctorsList] = useState(false);

  const { data: conversationsData } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await messagesAPI.getConversations();
      return response.data.data;
    },
    refetchInterval: 30000,
  });

  // Fetch available doctors
  const { data: doctorsData } = useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const response = await authAPI.getProviders();
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

  // Join/leave conversation rooms
  React.useEffect(() => {
    if (!socket || !selectedConversation?.conversationId) return;
    socket.emit("join-conversation", selectedConversation.conversationId);
    return () => {
      socket.emit("leave-conversation", selectedConversation.conversationId);
    };
  }, [socket, selectedConversation?.conversationId]);

  // Real-time message listener
  React.useEffect(() => {
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
      if (selectedConversation) {
        sendMessageMutation.mutate(content);
      }
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

  const handleStartConversation = (doctor) => {
    setSelectedConversation({
      conversationId: null,
      participant: doctor,
    });
    setShowDoctorsList(false);
    // Fetch existing messages if any
    queryClient.invalidateQueries({
      queryKey: ["messages", doctor._id],
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-md h-[calc(100vh-16rem)] flex overflow-hidden theme-surface">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 flex-1">
              <MessageSquareText className="h-4 w-4 text-primary" />
              {showDoctorsList ? "Doctors" : "Conversations"}
            </h3>
            <Button
              size="sm"
              variant={showDoctorsList ? "default" : "outline"}
              onClick={() => setShowDoctorsList(!showDoctorsList)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
        </div>

        {showDoctorsList ? (
          <div className="flex-1 overflow-y-auto">
            {doctorsData && doctorsData.length > 0 ? (
              doctorsData.map((doctor) => (
                <div
                  key={doctor._id}
                  onClick={() => handleStartConversation(doctor)}
                  className="p-4 border-b border-border cursor-pointer hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                      {doctor.profile?.firstName?.[0]}
                      {doctor.profile?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {doctor.providerInfo?.specialization ||
                          "Healthcare Provider"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
                No doctors available
              </div>
            )}
          </div>
        ) : (
          <ConversationList
            conversations={conversationsData}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
          />
        )}
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold mr-3">
                    {selectedConversation.participant?.profile?.firstName?.[0]}
                    {selectedConversation.participant?.profile?.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {selectedConversation.participant?.profile?.firstName}{" "}
                      {selectedConversation.participant?.profile?.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.participant?.role === "provider"
                        ? selectedConversation.participant?.providerInfo
                            ?.specialization || "Healthcare Provider"
                        : "Patient"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversation(null)}
                >
                  ×
                </Button>
              </div>
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
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageSquareText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">
                {showDoctorsList
                  ? "Select a doctor to start messaging"
                  : "Select a conversation or create a new one"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesTab;
