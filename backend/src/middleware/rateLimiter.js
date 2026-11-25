const rateLimit = require("express-rate-limit");
const config = require("../config/env");

const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 mins
  max: config.RATE_LIMIT_MAX, // max 100 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes."
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 login/register attempts per 15 mins
  message: {
    success: false,
    message: "Too many authentication attempts, please wait a while before retrying."
  }
});

module.exports = { apiLimiter, authLimiter };
