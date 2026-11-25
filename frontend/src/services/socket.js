import { io } from "socket.io-client";

let socket = null;

export const getSocket = (token) => {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

  if (!socket) {
    socket = io(socketUrl, {
      auth: { token: token || (typeof window !== "undefined" ? localStorage.getItem("chatbot_token") : "") },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on("connect", () => {
      console.log("[Socket.io] Connected successfully. Socket ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket.io] Connection warning:", err.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
