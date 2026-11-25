import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { Bot, Sparkles, MessageSquare } from "lucide-react";

export default function ChatWindow({
  conversation,
  messages,
  streamingMessage,
  isBotTyping,
  onSendMessage,
  onRateMessage,
  onOpenFeedback,
  activeCategory,
  onChangeCategory,
  botName
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll on new message or stream chunk
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage, isBotTyping]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#0b1120] overflow-hidden">
      {/* Top Banner / Session Header */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {conversation?.title || "New Chat"}
            </h2>
            <p className="text-[11px] text-slate-400">
              Powered by OpenAI GPT API & Socket.io WebSockets
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          Live Stream Ready
        </div>
      </div>

      {/* Messages Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
        {messages.length === 0 && !streamingMessage ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto space-y-4 text-slate-500 dark:text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <Bot className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                Welcome to {botName || "Antigravity AI"}!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your full-stack real-time conversational AI companion. Select a persona and ask anything to get started!
              </p>
            </div>

            {/* Quick Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-4 text-left">
              {[
                { title: "Code Helper", text: "How to implement WebSockets in Node.js?", cat: "coding" },
                { title: "Professional", text: "Draft an executive summary for an AI startup", cat: "professional" },
                { title: "Creative Story", text: "Write a cyberpunk intro scene in Neo Tokyo", cat: "creative" },
                { title: "Casual Chat", text: "Tell me a fun science fact with an analogy", cat: "casual" }
              ].map((card, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onChangeCategory(card.cat);
                    onSendMessage(card.text);
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-indigo-500 dark:hover:border-indigo-500 text-xs transition group text-left"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block mb-0.5">
                    {card.title}
                  </span>
                  <span className="text-slate-400 line-clamp-1">{card.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg._id || index}
                message={msg}
                onRate={onRateMessage}
                onOpenFeedback={onOpenFeedback}
                botName={botName}
              />
            ))}

            {/* Real-time Streaming message if actively streaming */}
            {streamingMessage && (
              <MessageBubble
                message={{
                  sender: "bot",
                  content: streamingMessage,
                  botName: botName || "Antigravity AI",
                  createdAt: new Date().toISOString()
                }}
                botName={botName}
              />
            )}

            {/* Typing Indicator */}
            {isBotTyping && !streamingMessage && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs py-2 px-3 bg-white dark:bg-slate-800 rounded-xl w-fit border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse">
                <Bot className="w-4 h-4 text-indigo-500" />
                <span>{botName || "AI"} is thinking</span>
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <ChatInput
        onSendMessage={onSendMessage}
        isBotTyping={isBotTyping}
        activeCategory={activeCategory}
        onChangeCategory={onChangeCategory}
      />
    </div>
  );
}
