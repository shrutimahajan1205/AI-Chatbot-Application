const jwt = require("jsonwebtoken");
const config = require("../config/env");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, message: "User not found with this token" });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Not authorized, token invalid or expired" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Access forbidden: Admin privilege required" });
};

module.exports = { protect, adminOnly };
