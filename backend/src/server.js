const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const config = require("./config/env");
const { connectDB } = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const initSocket = require("./services/socketService");

// Route imports
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Attach socket logic
initSocket(io);

// Core Middlewares
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiLimiter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "AI-Powered Real-time Chatbot Backend",
    version: "1.0.0"
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Central Error Handler
app.use(errorHandler);

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();
  const PORT = config.PORT;
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Chatbot Backend running at http://localhost:${PORT}`);
    console.log(`📡 WebSocket / Socket.io server active and listening`);
    console.log(`🛡️  Rate Limiter & JWT Security Middleware enabled`);
    console.log(`====================================================`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };
