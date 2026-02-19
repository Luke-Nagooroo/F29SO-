import React from "react";

const ChatbotButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-800"
      aria-label="Open AI assistant"
    >
      <span className="text-lg font-bold">AI</span>
    </button>
  );
};

export default ChatbotButton;
