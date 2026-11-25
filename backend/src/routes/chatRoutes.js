const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const { validateMessage } = require("../middleware/validate");

router.post("/message", protect, validateMessage, sendMessage);
router.get("/messages/:conversationId", protect, getMessages);

module.exports = router;
