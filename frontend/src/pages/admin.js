import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  Users,
  MessageSquare,
  Zap,
  Star,
  Activity,
  ArrowLeft,
  Server,
  ShieldAlert,
  Clock,
  Sparkles,
  Cpu,
  Coffee,
  Briefcase
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        setError("Access Denied: You must be an administrator to view this page.");
        setFetching(false);
      } else {
        fetchAdminData();
      }
    }
  }, [user, loading, router]);

  const fetchAdminData = async () => {
    try {
      setFetching(true);
      const [analyticsRes, usersRes] = await Promise.all([
        api.get("/admin/analytics"),
        api.get("/admin/users")
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.analytics);
      }
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load admin analytics");
    } finally {
      setFetching(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400">Loading Analytics Dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Unauthorized Access</h2>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <Link
          href="/"
          className="px-4 py-2 bg-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-500 transition"
        >
          Return to Chat
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 font-sans">
      <Head>
        <title>Admin Panel & Analytics | AI Chatbot</title>
      </Head>

      {/* Top Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Back to Chat"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Admin Analytics Dashboard</h1>
            <p className="text-xs text-slate-400">Live AI Chatbot Performance & User Engagement Monitoring</p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          Refresh Data
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Users</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                {analytics?.totalUsers || 0}
              </h3>
              <span className="text-[11px] text-emerald-500 font-medium">Active Accounts</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Total Conversations */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversations</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                {analytics?.totalConversations || 0}
              </h3>
              <span className="text-[11px] text-indigo-500 font-medium">Chat Sessions Created</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          {/* Average Latency */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg AI Latency</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                {analytics?.avgLatencyMs || 0} <span className="text-sm font-normal text-slate-400">ms</span>
              </h3>
              <span className="text-[11px] text-emerald-500 font-medium">High Performance Speed</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
          </div>

          {/* Average Rating */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg User Rating</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white flex items-center gap-1">
                {analytics?.avgRating || 5.0} <span className="text-amber-400 text-lg">★</span>
              </h3>
              <span className="text-[11px] text-purple-500 font-medium">{analytics?.totalFeedbacks || 0} Submissions</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Section 2: Persona Breakdown & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Persona Distribution */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Chatbot Persona Usage Distribution
            </h3>

            <div className="space-y-3 pt-2">
              {[
                { name: "Casual Companion", count: analytics?.categoryBreakdown?.casual || 0, icon: Coffee, color: "bg-emerald-500" },
                { name: "Coding Architect", count: analytics?.categoryBreakdown?.coding || 0, icon: Cpu, color: "bg-blue-500" },
                { name: "Corporate Consultant", count: analytics?.categoryBreakdown?.professional || 0, icon: Briefcase, color: "bg-amber-500" },
                { name: "Creative Storyteller", count: analytics?.categoryBreakdown?.creative || 0, icon: Sparkles, color: "bg-purple-500" }
              ].map((item, idx) => {
                const total = Math.max(analytics?.totalConversations || 1, 1);
                const percent = Math.round((item.count / total) * 100);
                const Icon = item.icon;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Icon className="w-3.5 h-3.5 text-slate-400" /> {item.name}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">{item.count} sessions ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Runtime Health */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-500" />
              System Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">API Health</span>
                <span className="font-semibold text-emerald-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Uptime</span>
                <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">
                  {Math.round((analytics?.systemStatus?.uptimeSeconds || 0) / 60)} mins
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Node Runtime</span>
                <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">
                  {analytics?.systemStatus?.nodeVersion || "v24.x"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Memory Heap</span>
                <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">
                  {analytics?.systemStatus?.memoryUsageMb || 45} MB
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">WebSocket Transport</span>
                <span className="font-semibold text-indigo-500">Socket.io (Active)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Registered Users List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Registered Users Directory
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {u.username}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {u.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        u.role === "admin"
                          ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
