import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send, SmilePlus } from "lucide-react";

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const MessageThread = ({
  conversation,
  messages = [],
  onSendMessage,
  currentUserId = "me",
}) => {
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, conversation?.id]);

  const groupedMessages = useMemo(() => messages, [messages]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    onSendMessage?.(content);
    setDraft("");
  };

  if (!conversation) {
    return (
      <section className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-slate-400">
        Select a conversation to start messaging.
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-950/50">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">{conversation.name}</h2>
        <p className="text-sm text-slate-400">
          {conversation.roleLabel || "Connected care messaging"}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {groupedMessages.map((message) => {
          const mine = message.senderId === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  mine
                    ? "bg-cyan-500 text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-100"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                <div
                  className={`mt-2 text-right text-[11px] ${
                    mine ? "text-slate-900/70" : "text-slate-500"
                  }`}
                >
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          );
        })}

        {groupedMessages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            No messages in this thread yet.
          </div>
        )}

        <div ref={endRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-white/10 bg-black/20 p-4"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <button
            type="button"
            className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Add reaction"
          >
            <SmilePlus size={18} />
          </button>

          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />

          <button
            type="submit"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-slate-950 transition hover:bg-cyan-400"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </section>
  );
};

export default MessageThread;
