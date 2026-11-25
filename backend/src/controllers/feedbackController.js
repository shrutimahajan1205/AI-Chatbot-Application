const Feedback = require("../models/Feedback");
const Message = require("../models/Message");

const submitFeedback = async (req, res, next) => {
  try {
    const { messageId, rating, comment } = req.body;

    if (!messageId || !rating) {
      return res.status(400).json({ success: false, message: "messageId and rating (1-5) are required." });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Update rating directly on message
    await Message.findByIdAndUpdate(messageId, {
      rating,
      feedbackText: comment || ""
    });

    // Create persistent feedback record
    const feedback = await Feedback.create({
      messageId,
      userId: req.user._id,
      rating,
      comment: comment || ""
    });

    return res.status(201).json({
      success: true,
      message: "Feedback recorded successfully",
      feedback
    });
  } catch (err) {
    next(err);
  }
};

const getFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find();
    return res.status(200).json({ success: true, count: feedbacks.length, feedbacks });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitFeedback, getFeedbacks };
