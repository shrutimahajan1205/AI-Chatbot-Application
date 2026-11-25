const express = require("express");
const router = express.Router();
const { getAnalytics, getUsers } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/analytics", protect, adminOnly, getAnalytics);
router.get("/users", protect, adminOnly, getUsers);

module.exports = router;
