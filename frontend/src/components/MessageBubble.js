import React, { useState } from "react";
import { Bot, User, Volume2, Copy, Check, Star, MessageSquarePlus } from "lucide-react";

export default function MessageBubble({ message, onRate, onOpenFeedback, botName }) {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const isBot = message.sender === "bot";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-Speech is not supported in this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop ongoing speech
    // Clean markdown code blocks from speech for natural audio
    const cleanText = message.content.replace(/```[\s\S]*?```/g, "Code block omitted.");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Format markdown with basic headings, code blocks, lists, bold
  const renderFormattedContent = (content) => {
    if (!content) return null;

    // Detect fenced code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : "";
        const code = language ? lines.slice(1).join("\n") : lines.join("\n");

        return (
          <div key={index} className="relative my-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 text-slate-100">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 text-xs font-mono text-slate-300 border-b border-slate-700">
              <span>{language || "code"}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                }}
                className="hover:text-white transition flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <pre className="p-3 text-xs overflow-x-auto font-mono">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Format bold, italics, bullets, paragraphs
      return (
        <div key={index} className="space-y-1.5 prose-chat">
          {part.split("\n\n").map((paragraph, pIdx) => {
            if (!paragraph.trim()) return null;

            // Check if heading
            if (paragraph.startsWith("### ")) {
              return <h3 key={pIdx} className="text-base font-bold text-slate-800 dark:text-slate-100">{paragraph.replace("### ", "")}</h3>;
            }
            if (paragraph.startsWith("## ")) {
              return <h2 key={pIdx} className="text-lg font-bold text-slate-800 dark:text-slate-100">{paragraph.replace("## ", "")}</h2>;
            }

            // Bullet points
            if (paragraph.includes("\n- ") || paragraph.startsWith("- ")) {
              const bullets = paragraph.split("\n- ").map(b => b.replace(/^- /, ""));
              return (
                <ul key={pIdx} className="list-disc ml-5 space-y-1 text-sm">
                  {bullets.map((b, bIdx) => (
                    <li key={bIdx} dangerouslySetInnerHTML={{ __html: formatInline(b) }} />
                  ))}
                </ul>
              );
            }

            return (
              <p
                key={pIdx}
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatInline(paragraph) }}
              />
            );
          })}
        </div>
      );
    });
  };

  const formatInline = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code class='bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-1 py-0.5 rounded text-xs'>$1</code>");
  };

  return (
    <div className={`flex w-full my-3 ${isBot ? "justify-start" : "justify-end"}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isBot ? "flex-row" : "flex-row-reverse"}`}>
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${
            isBot
              ? "bg-gradient-to-tr from-indigo-500 to-purple-600"
              : "bg-gradient-to-tr from-emerald-500 to-teal-600"
          }`}
        >
          {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </div>

        {/* Message Content Container */}
        <div className="flex flex-col space-y-1">
          {/* Header Name & Timestamp */}
          <div className={`flex items-center space-x-2 text-xs text-slate-400 ${isBot ? "justify-start" : "justify-end"}`}>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {isBot ? (message.botName || botName || "Antigravity AI") : "You"}
            </span>
            <span>
              {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {message.latencyMs > 0 && (
              <span className="text-[10px] text-slate-400 font-mono">
                ({message.latencyMs}ms)
              </span>
            )}
          </div>

          {/* Bubble */}
          <div
            className={`p-3.5 rounded-2xl shadow-sm text-sm ${
              isBot
                ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-sm"
                : "bg-indigo-600 text-white rounded-tr-sm"
            }`}
          >
            {renderFormattedContent(message.content)}
          </div>

          {/* Bot Actions: Copy, TTS Audio, Rating Stars, Feedback button */}
          {isBot && message._id && (
            <div className="flex items-center space-x-3 pt-1 text-slate-400 text-xs">
              {/* Copy */}
              <button
                onClick={handleCopy}
                className="hover:text-indigo-500 transition flex items-center gap-1"
                title="Copy message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              {/* TTS Read Aloud */}
              <button
                onClick={handleSpeech}
                className={`hover:text-indigo-500 transition flex items-center gap-1 ${isPlayingAudio ? "text-indigo-500 font-semibold" : ""}`}
                title="Listen to response (TTS)"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? "animate-bounce" : ""}`} />
                <span>{isPlayingAudio ? "Stop" : "Speak"}</span>
              </button>

              {/* Star Rating (1 - 5) */}
              <div className="flex items-center space-x-0.5 border-l border-slate-200 dark:border-slate-700 pl-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onRate && onRate(message._id, star)}
                    className="p-0.5 hover:scale-110 transition"
                    title={`Rate ${star} Stars`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        (message.rating || 0) >= star
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300 dark:text-slate-600 hover:text-amber-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Feedback Dialog Trigger */}
              <button
                onClick={() => onOpenFeedback && onOpenFeedback(message)}
                className="hover:text-purple-500 transition flex items-center gap-1"
                title="Add comments or review"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Feedback</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
