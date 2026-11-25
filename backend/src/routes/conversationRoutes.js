const express = require("express");
const router = express.Router();
const {
  getConversations,
  createConversation,
  getConversationById,
  updateConversation,
  deleteConversation
} = require("../controllers/conversationController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getConversations)
  .post(protect, createConversation);

router.route("/:id")
  .get(protect, getConversationById)
  .put(protect, updateConversation)
  .delete(protect, deleteConversation);

module.exports = router;
