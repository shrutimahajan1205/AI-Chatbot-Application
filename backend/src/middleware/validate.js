const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || username.trim().length < 3) {
    return res.status(400).json({ success: false, message: "Username must be at least 3 characters long." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "A valid email address is required." });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }
  next();
};

const validateMessage = (req, res, next) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: "Message content cannot be empty." });
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateMessage };
