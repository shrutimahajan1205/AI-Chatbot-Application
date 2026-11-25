const mongoose = require("mongoose");
const { getIsMock } = require("../config/db");
const mockStore = require("./mockStore");

const FeedbackSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const MongoFeedback = mongoose.model("Feedback", FeedbackSchema);

class FeedbackModel {
  static async create(data) {
    if (getIsMock()) {
      const fb = {
        _id: mockStore.genId(),
        messageId: data.messageId.toString(),
        userId: data.userId.toString(),
        rating: data.rating,
        comment: data.comment || "",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockStore.feedbacks.push(fb);
      return fb;
    }
    return await MongoFeedback.create(data);
  }

  static async find(query = {}) {
    if (getIsMock()) {
      return [...mockStore.feedbacks].reverse();
    }
    return await MongoFeedback.find(query).sort({ createdAt: -1 });
  }

  static async countDocuments() {
    if (getIsMock()) {
      return mockStore.feedbacks.length;
    }
    return await MongoFeedback.countDocuments();
  }
}

module.exports = FeedbackModel;
