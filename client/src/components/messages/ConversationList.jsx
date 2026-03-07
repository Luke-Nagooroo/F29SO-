import React from "react";
import { MessageCircle, Search } from "lucide-react";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const ConversationList = ({
  conversations = [],
  selectedConversation,
  onSelectConversation,
  title = "Conversations",
}) => {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="text-sm text-slate-400">
              {conversations.length} active conversation{conversations.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-black/20 p-2 text-slate-300">
            <Search size={16} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-slate-400">
            <MessageCircle className="text-slate-500" />
            <p>No conversations yet.</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const name = conversation.name || conversation.participant?.name || "Unknown User";
            const active = selectedConversation?.id === conversation.id;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation)}
                className={`w-full border-b border-white/5 px-4 py-4 text-left transition ${
                  active ? "bg-cyan-500/10" : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 font-semibold text-cyan-200">
                    {getInitials(name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <h3 className="truncate text-sm font-semibold text-white">{name}</h3>
                      <span className="shrink-0 text-xs text-slate-500">
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    </div>

                    <p className="truncate text-sm text-slate-400">
                      {conversation.lastMessage || "Start the conversation"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ConversationList;
