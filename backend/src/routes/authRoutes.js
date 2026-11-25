const express = require("express");
const router = express.Router();
const { register, login, getMe, updatePreferences } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateRegister, validateLogin } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.get("/me", protect, getMe);
router.put("/preferences", protect, updatePreferences);

module.exports = router;
