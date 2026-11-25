const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const aiService = require("../services/aiService");

const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, category = "casual", botName = "Antigravity AI" } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ success: false, message: "conversationId and content are required." });
    }

    // Save user message
    const userMessage = await Message.create({
      conversationId,
      sender: "user",
      content,
      category,
      botName
    });

    // Update conversation lastMessageAt
    await Conversation.findByIdAndUpdate(conversationId, { lastMessageAt: new Date() });

    // Fetch message history for context
    const history = await Message.find({ conversationId });

    // Generate AI response
    const aiResult = await aiService.generateResponse({
      prompt: content,
      category,
      botName,
      history
    });

    // Save bot message
    const botMessage = await Message.create({
      conversationId,
      sender: "bot",
      content: aiResult.content,
      category,
      botName,
      tokens: aiResult.tokens,
      latencyMs: aiResult.latencyMs
    });

    return res.status(200).json({
      success: true,
      userMessage,
      botMessage,
      meta: {
        latencyMs: aiResult.latencyMs,
        tokens: aiResult.tokens,
        fromCache: aiResult.fromCache
      }
    });
  } catch (err) {
    next(err);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId });
    return res.status(200).json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendMessage, getMessages };
