import React, { useState } from "react";
import { X, Sparkles, Check, Bot } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function PersonalizationModal({ isOpen, onClose, currentBotName, currentCategory, onSave }) {
  const [botName, setBotName] = useState(currentBotName || "Antigravity AI");
  const [category, setCategory] = useState(currentCategory || "casual");
  const { theme, toggleTheme, setTheme } = useTheme();

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ botName, defaultCategory: category, theme });
    onClose();
  };

  const categories = [
    { id: "casual", name: "Casual Companion", desc: "Warm, conversational, empathetic tone" },
    { id: "coding", name: "Coding Architect", desc: "Clean code snippets, debugging, and system design" },
    { id: "professional", name: "Corporate Consultant", desc: "Structured briefings, executive summaries" },
    { id: "creative", name: "Creative Storyteller", desc: "Imaginative metaphors, scripts, worldbuilding" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Personalize Chatbot</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bot Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Chatbot Name
          </label>
          <input
            type="text"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g. Jarvis, Nova, CodeBuddy"
          />
        </div>

        {/* Persona Categories */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            AI Persona Mode
          </label>
          <div className="grid grid-cols-1 gap-2">
            {categories.map((c) => (
              <div
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  category === c.id
                    ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="font-semibold text-sm">{c.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{c.desc}</div>
                </div>
                {category === c.id && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Theme mode */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Color Theme
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                theme === "dark"
                  ? "bg-slate-900 text-white border-indigo-500 ring-2 ring-indigo-500/50"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent"
              }`}
            >
              🌙 Dark Mode
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                theme === "light"
                  ? "bg-white text-slate-900 border-indigo-500 ring-2 ring-indigo-500/50 shadow"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent"
              }`}
            >
              ☀️ Light Mode
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
