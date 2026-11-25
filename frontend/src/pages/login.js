import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Bot, Sparkles, ShieldCheck, Zap, Lock, Mail, User, Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const res = await register(username, email, password);
        if (!res.success) setError(res.message);
      } else {
        const res = await login(email, password);
        if (!res.success) setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo credentials filler
  const fillDemoAdmin = () => {
    setIsRegister(false);
    setEmail("admin@example.com");
    setPassword("admin123");
  };

  const fillDemoUser = () => {
    setIsRegister(false);
    setEmail("demo@example.com");
    setPassword("password123");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors">
      <Head>
        <title>{isRegister ? "Sign Up" : "Sign In"} | AI Real-Time Chatbot</title>
      </Head>

      {/* Decorative gradient blur background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Theme toggle in corner */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm"
      >
        {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
      </button>

      {/* Container card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Bot className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isRegister ? "Create Your Account" : "Welcome Back"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time conversational AI powered by Next.js & WebSockets
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(""); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              !isRegister
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(""); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              isRegister
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Username</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alex_developer"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In to Chat"}
          </button>
        </form>

        {/* 1-Click Demo Login Shortcuts */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2.5">
            Quick Demo Access (1-Click)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="py-1.5 px-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-medium hover:bg-purple-100 transition"
            >
              👑 Demo Admin
            </button>
            <button
              type="button"
              onClick={fillDemoUser}
              className="py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 transition"
            >
              👤 Demo User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
