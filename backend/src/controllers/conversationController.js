const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id });
    return res.status(200).json({ success: true, count: conversations.length, conversations });
  } catch (err) {
    next(err);
  }
};

const createConversation = async (req, res, next) => {
  try {
    const { title, category, botName } = req.body;
    const conversation = await Conversation.create({
      userId: req.user._id,
      title: title || "New Conversation",
      category: category || req.user.preferences?.defaultCategory || "casual",
      botName: botName || req.user.preferences?.botName || "Antigravity AI"
    });

    return res.status(201).json({ success: true, conversation });
  } catch (err) {
    next(err);
  }
};

const getConversationById = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    const messages = await Message.find({ conversationId: conversation._id });
    return res.status(200).json({ success: true, conversation, messages });
  } catch (err) {
    next(err);
  }
};

const updateConversation = async (req, res, next) => {
  try {
    const { title, category, botName } = req.body;
    const updated = await Conversation.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(category && { category }),
        ...(botName && { botName })
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    return res.status(200).json({ success: true, conversation: updated });
  } catch (err) {
    next(err);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    const deleted = await Conversation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    return res.status(200).json({ success: true, message: "Conversation deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getConversations,
  createConversation,
  getConversationById,
  updateConversation,
  deleteConversation
};
