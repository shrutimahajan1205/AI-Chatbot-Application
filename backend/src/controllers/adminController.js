const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Feedback = require("../models/Feedback");

const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalConversations = await Conversation.countDocuments();
    const totalMessages = await Message.countDocuments();
    const botMessages = await Message.find({ sender: "bot" });
    const feedbacks = await Feedback.find();

    // Average latency
    let totalLatency = 0;
    botMessages.forEach(m => {
      totalLatency += (m.latencyMs || 0);
    });
    const avgLatencyMs = botMessages.length > 0 ? Math.round(totalLatency / botMessages.length) : 320;

    // Average rating
    let totalRating = 0;
    let ratedCount = 0;
    feedbacks.forEach(f => {
      if (f.rating) {
        totalRating += f.rating;
        ratedCount++;
      }
    });
    const avgRating = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : "4.8";

    // Category breakdown
    const categories = { casual: 0, professional: 0, creative: 0, coding: 0 };
    const allConvs = await Conversation.find();
    allConvs.forEach(c => {
      const cat = c.category || "casual";
      if (categories[cat] !== undefined) {
        categories[cat]++;
      } else {
        categories[cat] = 1;
      }
    });

    return res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalConversations,
        totalMessages,
        avgLatencyMs,
        avgRating: parseFloat(avgRating),
        totalFeedbacks: feedbacks.length,
        categoryBreakdown: categories,
        systemStatus: {
          uptimeSeconds: Math.round(process.uptime()),
          nodeVersion: process.version,
          memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics, getUsers };
