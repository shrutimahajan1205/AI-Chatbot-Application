import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("chatbot_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 unauthorized to automatically log out if expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        localStorage.removeItem("chatbot_token");
        localStorage.removeItem("chatbot_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
