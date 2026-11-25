const jwt = require("jsonwebtoken");
const config = require("../config/env");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const aiService = require("./aiService");

const initSocket = (io) => {
  // Authentication handshake middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
      if (token) {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          socket.user = user;
        }
      }
      return next();
    } catch (err) {
      console.warn("[Socket.io] Auth token verification failed, proceeding in guest mode:", err.message);
      return next();
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id} (User: ${socket.user?.username || "Guest"})`);

    // Join a specific conversation room
    socket.on("join_conversation", (conversationId) => {
      const room = `conv_${conversationId}`;
      socket.join(room);
      console.log(`[Socket.io] Socket ${socket.id} joined room: ${room}`);
      socket.emit("joined_conversation", { conversationId, room });
    });

    // Leave a conversation room
    socket.on("leave_conversation", (conversationId) => {
      const room = `conv_${conversationId}`;
      socket.leave(room);
      console.log(`[Socket.io] Socket ${socket.id} left room: ${room}`);
    });

    // Typing indicators
    socket.on("typing_start", ({ conversationId, username }) => {
      socket.to(`conv_${conversationId}`).emit("user_typing", {
        conversationId,
        username: username || socket.user?.username || "User"
      });
    });

    socket.on("typing_stop", ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit("user_stop_typing", { conversationId });
    });

    // Real-time message sending & AI response streaming
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, content, category = "casual", botName = "Antigravity AI" } = data;

        if (!conversationId || !content) {
          return socket.emit("error_event", { message: "conversationId and content are required." });
        }

        const room = `conv_${conversationId}`;

        // 1. Save user message to database
        const userMsg = await Message.create({
          conversationId,
          sender: "user",
          content,
          category,
          botName
        });

        // 2. Broadcast user message to room
        io.to(room).emit("new_message", userMsg);

        // 3. Update conversation lastMessageAt
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessageAt: new Date()
        });

        // 4. Notify clients that the bot is thinking/typing
        io.to(room).emit("bot_typing", { conversationId, isTyping: true });

        // 5. Fetch past messages for conversational context
        const history = await Message.find({ conversationId });

        // 6. Generate AI response
        const aiResult = await aiService.generateResponse({
          prompt: content,
          category,
          botName,
          history
        });

        // 7. Stream simulated response chunks in real-time
        const words = aiResult.content.split(" ");
        let accumulated = "";

        for (let i = 0; i < words.length; i++) {
          accumulated += (i === 0 ? "" : " ") + words[i];
          io.to(room).emit("bot_stream_chunk", {
            conversationId,
            chunk: words[i] + " ",
            accumulatedText: accumulated,
            isComplete: false
          });
          // Small delay for natural streaming visualization
          await new Promise((r) => setTimeout(r, 25));
        }

        // 8. Persist bot message to database
        const botMsg = await Message.create({
          conversationId,
          sender: "bot",
          content: aiResult.content,
          category,
          botName,
          tokens: aiResult.tokens,
          latencyMs: aiResult.latencyMs
        });

        // 9. Stop typing and emit completed message
        io.to(room).emit("bot_typing", { conversationId, isTyping: false });
        io.to(room).emit("new_message", botMsg);
        io.to(room).emit("bot_stream_chunk", {
          conversationId,
          chunk: "",
          accumulatedText: aiResult.content,
          isComplete: true,
          messageId: botMsg._id
        });

      } catch (error) {
        console.error("[Socket.io] send_message error:", error);
        socket.emit("error_event", { message: error.message || "Failed to process message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
