const jwt = require("jsonwebtoken");
const config = require("../config/env");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: "Username is already taken." });
    }

    // First registered user or matching admin email becomes admin
    const totalUsers = await User.countDocuments();
    const role = totalUsers === 0 || email.toLowerCase().includes("admin") ? "admin" : "user";

    const user = await User.create({
      username,
      email,
      password,
      role,
      preferences: {
        theme: "dark",
        botName: "Antigravity AI",
        defaultCategory: "casual"
      }
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (err) {
    next(err);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const { theme, botName, defaultCategory } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        preferences: {
          theme: theme || req.user.preferences?.theme || "dark",
          botName: botName || req.user.preferences?.botName || "Antigravity AI",
          defaultCategory: defaultCategory || req.user.preferences?.defaultCategory || "casual"
        }
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: updated.preferences
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updatePreferences };
