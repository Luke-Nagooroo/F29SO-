import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  MessageSquareText,
  Plus,
  UserPlus,
  X,
} from "lucide-react";
import ConversationList from "../messages/ConversationList";
import MessageThread from "../messages/MessageThread";
import { messagesAPI, authAPI } from "../../api";
import { useSocket } from "../../context/SocketContext";
import { Button } from "@/components/ui/button";

const mobilePanelTransition = {
  type: "spring",
  stiffness: 320,
  damping: 30,
  mass: 0.9,
};

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
    refetchIntervalInBackground: false,
  });

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

  React.useEffect(() => {
    if (!socket || !selectedConversation?.conversationId) return;
    socket.emit("join-conversation", selectedConversation.conversationId);
    return () => {
      socket.emit("leave-conversation", selectedConversation.conversationId);
    };
  }, [socket, selectedConversation?.conversationId]);

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

  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation);
    setShowDoctorsList(false);
  }, []);

  const handleStartConversation = (doctor) => {
    setSelectedConversation({
      conversationId: null,
      participant: doctor,
    });
    setShowDoctorsList(false);
    queryClient.invalidateQueries({
      queryKey: ["messages", doctor._id],
    });
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const isShowingThread = !!selectedConversation;
  const panelTitle = showDoctorsList ? "New Message" : "Conversations";

  return (
    <div className="theme-surface flex h-[min(78vh,760px)] min-h-[560px] overflow-hidden rounded-[28px] border border-border bg-card shadow-md">
      <motion.aside
        className={`${
          isShowingThread ? "hidden md:flex" : "flex"
        } min-w-0 flex-1 flex-col border-r border-border md:w-[360px] md:max-w-[380px] md:flex-none`}
        initial={false}
        animate={
          isShowingThread
            ? { x: -24, opacity: 0.92 }
            : { x: 0, opacity: 1 }
        }
        transition={mobilePanelTransition}
      >
        <motion.div
          layout
          transition={mobilePanelTransition}
          className="flex h-full min-h-0 flex-col"
        >
          <div className="border-b border-border px-4 py-4 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  {showDoctorsList ? (
                    <UserPlus className="h-4 w-4 text-primary" />
                  ) : (
                    <MessageSquareText className="h-4 w-4 text-primary" />
                  )}
                  {panelTitle}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {showDoctorsList
                    ? "Choose a provider to start chatting"
                    : "Pick a contact to open the thread"}
                </p>
              </div>

              <Button
                size="sm"
                variant={showDoctorsList ? "default" : "outline"}
                onClick={() => setShowDoctorsList((prev) => !prev)}
                className="gap-1 rounded-full"
              >
                {showDoctorsList ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {showDoctorsList ? "Close" : "New"}
              </Button>
            </div>
          </div>

          {showDoctorsList ? (
            <div className="flex-1 overflow-y-auto">
              {doctorsData && doctorsData.length > 0 ? (
                doctorsData.map((doctor) => (
                  <button
                    key={doctor._id}
                    type="button"
                    onClick={() => handleStartConversation(doctor)}
                    className="flex w-full items-center gap-3 border-b border-border px-4 py-4 text-left transition-colors hover:bg-secondary/30"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                      {doctor.profile?.firstName?.[0]}
                      {doctor.profile?.lastName?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}
                      </h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {doctor.providerInfo?.specialization ||
                          "Healthcare Provider"}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
                  No doctors available
                </div>
              )}
            </div>
          ) : (
            <ConversationList
              className="flex-1 overflow-y-auto"
              conversations={conversationsData}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
            />
          )}
        </motion.div>
      </motion.aside>

      <section
        className={`${
          isShowingThread ? "flex" : "hidden md:flex"
        } min-w-0 flex-1 flex-col`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {selectedConversation ? (
            <motion.div
              key={`thread-${selectedConversation.participant?._id || "new"}`}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={mobilePanelTransition}
              className="flex h-full min-h-0 flex-col"
            >
              <div className="border-b border-border bg-card px-4 py-4 sm:px-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBackToList}
                      className="rounded-full md:hidden"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                      {selectedConversation.participant?.profile?.firstName?.[0]}
                      {selectedConversation.participant?.profile?.lastName?.[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-foreground">
                        {selectedConversation.participant?.profile?.firstName}{" "}
                        {selectedConversation.participant?.profile?.lastName}
                      </h3>
                      <p className="truncate text-sm text-muted-foreground">
                        {selectedConversation.participant?.role === "provider"
                          ? selectedConversation.participant?.providerInfo
                              ?.specialization || "Healthcare Provider"
                          : "Patient"}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToList}
                    className="hidden rounded-full md:inline-flex"
                    aria-label="Close conversation"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="min-h-0 flex-1">
                <MessageThread
                  messages={messagesData}
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                  onStopTyping={handleStopTyping}
                  conversationId={selectedConversation?.conversationId}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="messages-empty"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="hidden h-full items-center justify-center px-6 text-muted-foreground md:flex"
            >
              <div className="max-w-sm text-center">
                <MessageSquareText className="mx-auto mb-4 h-16 w-16 opacity-30" />
                <p className="text-lg">
                  {showDoctorsList
                    ? "Choose a doctor to start a new message."
                    : "Select a conversation to open the thread."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default MessagesTab;
