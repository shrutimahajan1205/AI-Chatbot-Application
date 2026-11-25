import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Sparkles, Code2, Briefcase, Coffee, CornerDownLeft } from "lucide-react";

export default function ChatInput({ onSendMessage, isBotTyping, activeCategory, onChangeCategory }) {
  const [content, setContent] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = (event) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!content.trim() || isBotTyping) return;
    onSendMessage(content.trim());
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const categories = [
    { id: "casual", label: "Casual", icon: Coffee, color: "text-emerald-500" },
    { id: "coding", label: "Coding Guru", icon: Code2, color: "text-blue-500" },
    { id: "professional", label: "Professional", icon: Briefcase, color: "text-amber-500" },
    { id: "creative", label: "Creative", icon: Sparkles, color: "text-purple-500" }
  ];

  return (
    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
      {/* Category Persona Switcher */}
      <div className="flex items-center space-x-2 mb-2.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium whitespace-nowrap">Persona:</span>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onChangeCategory(cat.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full whitespace-nowrap transition border ${
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : cat.color}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Field Container */}
      <div className="relative flex items-end gap-2 bg-slate-100 dark:bg-slate-800/90 rounded-2xl p-2 border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition shadow-inner">
        {/* Voice Input Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-2.5 rounded-xl transition ${
            isListening
              ? "bg-rose-500 text-white animate-pulse"
              : "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700/60"
          }`}
          title={isListening ? "Listening... click to stop" : "Voice input (Speech to Text)"}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening to your voice..." : "Type your message or prompt... (Enter to send)"}
          rows={1}
          className="flex-1 max-h-36 py-2 px-1 bg-transparent resize-none border-none outline-none text-slate-800 dark:text-slate-100 text-sm leading-relaxed"
        />

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isBotTyping}
          className={`p-2.5 rounded-xl font-medium transition ${
            content.trim() && !isBotTyping
              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95"
              : "text-slate-400 bg-slate-200 dark:bg-slate-700/50 cursor-not-allowed"
          }`}
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      <div className="flex justify-between items-center mt-1.5 px-2 text-[11px] text-slate-400">
        <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">Shift + Enter</kbd> for new line</span>
        {isListening && <span className="text-rose-500 font-medium animate-pulse">● Listening...</span>}
      </div>
    </div>
  );
}
