import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getSocket } from "../services/socket";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import PersonalizationModal from "../components/PersonalizationModal";
import FeedbackModal from "../components/FeedbackModal";
import { Menu } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, token, loading, updatePreferences } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [feedbackTargetMessage, setFeedbackTargetMessage] = useState(null);

  const [activeCategory, setActiveCategory] = useState("casual");
  const [botName, setBotName] = useState("Antigravity AI");

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load preferences
  useEffect(() => {
    if (user?.preferences) {
      if (user.preferences.botName) setBotName(user.preferences.botName);
      if (user.preferences.defaultCategory) setActiveCategory(user.preferences.defaultCategory);
    }
  }, [user]);

  // Fetch conversations
  useEffect(() => {
    if (user && token) {
      fetchConversations();
    }
  }, [user, token]);

  const fetchConversations = async () => {
    try {
      const res = await api.get("/conversations");
      if (res.data.success) {
        setConversations(res.data.conversations);
        if (res.data.conversations.length > 0 && !activeConversationId) {
          selectConversation(res.data.conversations[0]._id);
        }
      }
    } catch (err) {
      console.warn("Failed to load conversations:", err.message);
    }
  };

  // Socket.io Real-Time Listeners
  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);

    if (activeConversationId) {
      socket.emit("join_conversation", activeConversationId);
    }

    const handleNewMessage = (msg) => {
      if (msg.conversationId === activeConversationId) {
        setMessages((prev) => {
          // Prevent duplicates if already added locally
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleBotTyping = (data) => {
      if (data.conversationId === activeConversationId) {
        setIsBotTyping(data.isTyping);
      }
    };

    const handleBotStreamChunk = (data) => {
      if (data.conversationId === activeConversationId) {
        if (data.isComplete) {
          setStreamingMessage("");
        } else {
          setStreamingMessage(data.accumulatedText);
        }
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("bot_typing", handleBotTyping);
    socket.on("bot_stream_chunk", handleBotStreamChunk);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("bot_typing", handleBotTyping);
      socket.off("bot_stream_chunk", handleBotStreamChunk);
    };
  }, [activeConversationId, token]);

  const selectConversation = async (id) => {
    setActiveConversationId(id);
    setStreamingMessage("");
    setIsBotTyping(false);

    try {
      const res = await api.get(`/conversations/${id}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
        if (res.data.conversation?.category) {
          setActiveCategory(res.data.conversation.category);
        }
      }
    } catch (err) {
      console.warn("Failed to load messages:", err.message);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await api.post("/conversations", {
        title: `Chat (${activeCategory})`,
        category: activeCategory,
        botName: botName
      });
      if (res.data.success) {
        const newConv = res.data.conversation;
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(newConv._id);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to create new conversation:", err);
    }
  };

  const handleDeleteConversation = async (id) => {
    try {
      await api.delete(`/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeConversationId === id) {
        const remaining = conversations.filter((c) => c._id !== id);
        if (remaining.length > 0) {
          selectConversation(remaining[0]._id);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const handleSendMessage = async (content) => {
    let convId = activeConversationId;

    // If no active conversation exists, create one first
    if (!convId) {
      try {
        const titleSnippet = content.slice(0, 30) + (content.length > 30 ? "..." : "");
        const res = await api.post("/conversations", {
          title: titleSnippet,
          category: activeCategory,
          botName: botName
        });
        if (res.data.success) {
          const newConv = res.data.conversation;
          setConversations((prev) => [newConv, ...prev]);
          setActiveConversationId(newConv._id);
          convId = newConv._id;
        }
      } catch (e) {
        console.error("Failed to auto-create conversation:", e);
        return;
      }
    }

    const socket = getSocket(token);
    if (socket && socket.connected) {
      socket.emit("send_message", {
        conversationId: convId,
        content,
        category: activeCategory,
        botName: botName
      });
    } else {
      // REST fallback
      setIsBotTyping(true);
      try {
        const res = await api.post("/chat/message", {
          conversationId: convId,
          content,
          category: activeCategory,
          botName: botName
        });
        if (res.data.success) {
          setMessages((prev) => [...prev, res.data.userMessage, res.data.botMessage]);
        }
      } catch (err) {
        console.error("REST message error:", err);
      } finally {
        setIsBotTyping(false);
      }
    }
  };

  const handleRateMessage = async (messageId, rating) => {
    try {
      await api.post("/feedback", { messageId, rating });
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, rating } : m))
      );
    } catch (err) {
      console.error("Failed to rate message:", err);
    }
  };

  const handleSubmitFeedback = async (messageId, rating, comment) => {
    try {
      await api.post("/feedback", { messageId, rating, comment });
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, rating, feedbackText: comment } : m))
      );
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    }
  };

  const handleSavePreferences = async (newPrefs) => {
    if (newPrefs.botName) setBotName(newPrefs.botName);
    if (newPrefs.defaultCategory) setActiveCategory(newPrefs.defaultCategory);
    await updatePreferences(newPrefs);
  };

  const currentConversation = conversations.find((c) => c._id === activeConversationId);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400">Loading AI Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Head>
        <title>{botName} | Real-Time AI Chatbot</title>
        <meta name="description" content="AI-Powered Real-time Chatbot with Next.js, Express, Socket.io, and MongoDB" />
      </Head>

      {/* Header Navbar */}
      <Navbar
        onOpenPersonalize={() => setIsPersonalizeOpen(true)}
        activeCategory={activeCategory}
        botName={botName}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden absolute top-3 left-3 z-30 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 shadow"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Sidebar */}
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={selectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Chat Window */}
        <ChatWindow
          conversation={currentConversation}
          messages={messages}
          streamingMessage={streamingMessage}
          isBotTyping={isBotTyping}
          onSendMessage={handleSendMessage}
          onRateMessage={handleRateMessage}
          onOpenFeedback={(msg) => setFeedbackTargetMessage(msg)}
          activeCategory={activeCategory}
          onChangeCategory={(cat) => setActiveCategory(cat)}
          botName={botName}
        />
      </div>

      {/* Modals */}
      <PersonalizationModal
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        currentBotName={botName}
        currentCategory={activeCategory}
        onSave={handleSavePreferences}
      />

      <FeedbackModal
        isOpen={Boolean(feedbackTargetMessage)}
        onClose={() => setFeedbackTargetMessage(null)}
        message={feedbackTargetMessage}
        onSubmitFeedback={handleSubmitFeedback}
      />
    </div>
  );
}
