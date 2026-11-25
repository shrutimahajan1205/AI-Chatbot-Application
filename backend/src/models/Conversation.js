const mongoose = require("mongoose");
const { getIsMock } = require("../config/db");
const mockStore = require("./mockStore");

const ConversationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "New Conversation" },
    category: {
      type: String,
      enum: ["casual", "professional", "creative", "coding"],
      default: "casual"
    },
    botName: { type: String, default: "Antigravity AI" },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

ConversationSchema.index({ userId: 1, updatedAt: -1 });

const MongoConversation = mongoose.model("Conversation", ConversationSchema);

class ConversationModel {
  static async find(query = {}) {
    if (getIsMock()) {
      return mockStore.conversations
        .filter(c => !query.userId || c.userId.toString() === query.userId.toString())
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
    return await MongoConversation.find(query).sort({ updatedAt: -1 });
  }

  static async findById(id) {
    if (getIsMock()) {
      return mockStore.conversations.find(c => c._id.toString() === id.toString()) || null;
    }
    return await MongoConversation.findById(id);
  }

  static async create(data) {
    if (getIsMock()) {
      const newConv = {
        _id: mockStore.genId(),
        userId: data.userId.toString(),
        title: data.title || "New Conversation",
        category: data.category || "casual",
        botName: data.botName || "Antigravity AI",
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockStore.conversations.push(newConv);
      return newConv;
    }
    return await MongoConversation.create(data);
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    if (getIsMock()) {
      const idx = mockStore.conversations.findIndex(c => c._id.toString() === id.toString());
      if (idx === -1) return null;
      mockStore.conversations[idx] = {
        ...mockStore.conversations[idx],
        ...update,
        updatedAt: new Date()
      };
      return mockStore.conversations[idx];
    }
    return await MongoConversation.findByIdAndUpdate(id, update, options);
  }

  static async findByIdAndDelete(id) {
    if (getIsMock()) {
      const idx = mockStore.conversations.findIndex(c => c._id.toString() === id.toString());
      if (idx !== -1) {
        const deleted = mockStore.conversations.splice(idx, 1)[0];
        // delete attached messages too
        mockStore.messages = mockStore.messages.filter(m => m.conversationId.toString() !== id.toString());
        return deleted;
      }
      return null;
    }
    return await MongoConversation.findByIdAndDelete(id);
  }

  static async countDocuments() {
    if (getIsMock()) {
      return mockStore.conversations.length;
    }
    return await MongoConversation.countDocuments();
  }
}

module.exports = ConversationModel;
