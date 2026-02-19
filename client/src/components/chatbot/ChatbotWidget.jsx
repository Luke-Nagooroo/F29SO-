import React, { useEffect, useMemo, useRef, useState } from "react";
import { chatbotAPI } from "../../api";

const starterMessage = {
  role: "assistant",
  content:
    "Hi, I am your MEDXI health assistant. Ask me about healthy routines, sleep, hydration, fitness, or general wellness.",
  timestamp: new Date().toISOString(),
};

const ChatbotWidget = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([starterMessage]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = useMemo(
    () => [
      "Tips for better sleep",
      "How much water should I drink?",
      "Healthy meal ideas",
      "Ways to lower stress",
    ],
    [],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const response = await chatbotAPI.sendMessage({
        message: userMessage.content,
        conversationHistory: nextMessages.map(({ role, content }) => ({
          role,
          content,
        })),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            response?.data?.data?.response ||
            "I could not generate a response just now.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error?.response?.status === 401
              ? "Please log in to use the health assistant."
              : "I am having trouble responding right now. Please try again in a moment.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex h-[34rem] w-[22rem] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
        <div>
          <p className="text-sm font-semibold">AI Health Assistant</p>
          <p className="text-xs text-slate-300">Early wellness support widget</p>
        </div>
        <button type="button" onClick={onClose} className="text-2xl leading-none">
          ×
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
        {messages.map((message, index) => (
          <div
            key={`${message.timestamp}-${index}`}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                message.role === "user"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Try one of these
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-100"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="border-t border-slate-200 bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a general health question..."
            className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatbotWidget;
