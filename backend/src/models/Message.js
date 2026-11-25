const mongoose = require("mongoose");
const { getIsMock } = require("../config/db");
const mockStore = require("./mockStore");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true
    },
    sender: {
      type: String,
      enum: ["user", "bot"],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: "casual"
    },
    botName: {
      type: String,
      default: "Antigravity AI"
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    feedbackText: {
      type: String,
      default: ""
    },
    latencyMs: {
      type: Number,
      default: 0
    },
    tokens: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

const MongoMessage = mongoose.model("Message", MessageSchema);

class MessageModel {
  static async find(query = {}) {
    if (getIsMock()) {
      return mockStore.messages
        .filter(m => !query.conversationId || m.conversationId.toString() === query.conversationId.toString())
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return await MongoMessage.find(query).sort({ createdAt: 1 });
  }

  static async findById(id) {
    if (getIsMock()) {
      return mockStore.messages.find(m => m._id.toString() === id.toString()) || null;
    }
    return await MongoMessage.findById(id);
  }

  static async create(data) {
    if (getIsMock()) {
      const newMsg = {
        _id: mockStore.genId(),
        conversationId: data.conversationId.toString(),
        sender: data.sender,
        content: data.content,
        category: data.category || "casual",
        botName: data.botName || "Antigravity AI",
        rating: data.rating || null,
        feedbackText: data.feedbackText || "",
        latencyMs: data.latencyMs || 0,
        tokens: data.tokens || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockStore.messages.push(newMsg);
      return newMsg;
    }
    return await MongoMessage.create(data);
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    if (getIsMock()) {
      const idx = mockStore.messages.findIndex(m => m._id.toString() === id.toString());
      if (idx === -1) return null;
      mockStore.messages[idx] = {
        ...mockStore.messages[idx],
        ...update,
        updatedAt: new Date()
      };
      return mockStore.messages[idx];
    }
    return await MongoMessage.findByIdAndUpdate(id, update, options);
  }

  static async countDocuments(query = {}) {
    if (getIsMock()) {
      if (query.sender) {
        return mockStore.messages.filter(m => m.sender === query.sender).length;
      }
      return mockStore.messages.length;
    }
    return await MongoMessage.countDocuments(query);
  }
}

module.exports = MessageModel;
