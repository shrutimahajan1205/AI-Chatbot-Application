import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Bot, Sun, Moon, LogOut, Sliders, BarChart3, User, Sparkles } from "lucide-react";

export default function Navbar({ onOpenPersonalize, activeCategory, botName }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 flex items-center justify-between z-20">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-slate-800 dark:text-slate-100 text-lg tracking-tight">
              {botName || "Antigravity AI"}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
              {activeCategory || "Casual"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time Socket.io Connected
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Personalization Modal Trigger */}
        <button
          onClick={onOpenPersonalize}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Customize Chatbot"
        >
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span className="hidden sm:inline">Personalize</span>
        </button>

        {/* Admin Dashboard Link */}
        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Admin Analytics</span>
          </Link>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-800 space-x-2">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.username}</span>
              <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
