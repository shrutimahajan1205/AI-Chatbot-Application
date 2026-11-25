const crypto = require("crypto");

class MockStore {
  constructor() {
    this.users = [];
    this.conversations = [];
    this.messages = [];
    this.feedbacks = [];
    this.seedDefaultAdmin();
  }

  seedDefaultAdmin() {
    const bcrypt = require("bcryptjs");
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync("admin123", salt);

    this.users.push({
      _id: "admin-default-id",
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      preferences: {
        theme: "dark",
        botName: "Antigravity Assistant",
        defaultCategory: "casual"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Helper ID generator
  genId() {
    return crypto.randomUUID();
  }
}

const mockStore = new MockStore();
module.exports = mockStore;
