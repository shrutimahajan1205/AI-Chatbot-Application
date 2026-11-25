import React from "react";
import { Plus, MessageSquare, Trash2, Cpu, Sparkles, Briefcase, Coffee, Shield } from "lucide-react";

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  onClose
}) {
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "coding": return <Cpu className="w-3.5 h-3.5 text-blue-500" />;
      case "creative": return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      case "professional": return <Briefcase className="w-3.5 h-3.5 text-amber-500" />;
      default: return <Coffee className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* New Chat Action */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              onNewConversation();
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            Recent Conversations
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4 text-sm text-slate-400 dark:text-slate-500">
              No conversations yet. Start a new chat!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv._id === activeConversationId;
              return (
                <div
                  key={conv._id}
                  onClick={() => {
                    onSelectConversation(conv._id);
                    if (onClose) onClose();
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm transition ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800/60"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate pr-6">
                    {getCategoryIcon(conv.category)}
                    <span className="truncate">{conv.title || "Untitled Conversation"}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-500 transition"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            End-to-End JWT Auth
          </span>
          <span className="font-mono text-[10px]">v1.0.0</span>
        </div>
      </aside>
    </>
  );
}
