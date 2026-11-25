import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { getSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on initial client load
    const savedToken = localStorage.getItem("chatbot_token");
    const savedUser = localStorage.getItem("chatbot_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
        getSocket(savedToken);
      } catch (e) {
        localStorage.removeItem("chatbot_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.success) {
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem("chatbot_token", token);
      localStorage.setItem("chatbot_user", JSON.stringify(user));
      getSocket(token);
      return { success: true, user };
    }
    return { success: false, message: res.data.message };
  };

  const register = async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });
    if (res.data.success) {
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem("chatbot_token", token);
      localStorage.setItem("chatbot_user", JSON.stringify(user));
      getSocket(token);
      return { success: true, user };
    }
    return { success: false, message: res.data.message };
  };

  const updatePreferences = async (newPrefs) => {
    try {
      const res = await api.put("/auth/preferences", newPrefs);
      if (res.data.success) {
        const updatedUser = { ...user, preferences: res.data.preferences };
        setUser(updatedUser);
        localStorage.setItem("chatbot_user", JSON.stringify(updatedUser));
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("chatbot_token");
    localStorage.removeItem("chatbot_user");
    disconnectSocket();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
