const mongoose = require("express") && require("mongoose");
const bcrypt = require("bcryptjs");
const { getIsMock } = require("../config/db");
const mockStore = require("./mockStore");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    preferences: {
      theme: { type: String, default: "dark" },
      botName: { type: String, default: "Antigravity AI" },
      defaultCategory: { type: String, default: "casual" }
    }
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongoUser = mongoose.model("User", UserSchema);

class UserModel {
  static async findOne(query) {
    if (getIsMock()) {
      const user = mockStore.users.find(u => {
        if (query.email && u.email.toLowerCase() === query.email.toLowerCase()) return true;
        if (query.username && u.username.toLowerCase() === query.username.toLowerCase()) return true;
        if (query._id && u._id === query._id) return true;
        return false;
      });
      if (!user) return null;
      return {
        ...user,
        matchPassword: async (pwd) => bcrypt.compare(pwd, user.password),
        save: async () => user
      };
    }
    return await MongoUser.findOne(query);
  }

  static async findById(id) {
    if (getIsMock()) {
      const user = mockStore.users.find(u => u._id === id);
      if (!user) return null;
      return {
        ...user,
        matchPassword: async (pwd) => bcrypt.compare(pwd, user.password),
        save: async () => user
      };
    }
    return await MongoUser.findById(id).select("-password");
  }

  static async create(userData) {
    if (getIsMock()) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(userData.password, salt);
      const newUser = {
        _id: mockStore.genId(),
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || "user",
        preferences: {
          theme: userData.preferences?.theme || "dark",
          botName: userData.preferences?.botName || "Antigravity AI",
          defaultCategory: userData.preferences?.defaultCategory || "casual"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockStore.users.push(newUser);
      return {
        ...newUser,
        matchPassword: async (pwd) => bcrypt.compare(pwd, newUser.password)
      };
    }
    return await MongoUser.create(userData);
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    if (getIsMock()) {
      const index = mockStore.users.findIndex(u => u._id === id);
      if (index === -1) return null;
      if (update.preferences) {
        mockStore.users[index].preferences = {
          ...mockStore.users[index].preferences,
          ...update.preferences
        };
      }
      mockStore.users[index].updatedAt = new Date();
      return mockStore.users[index];
    }
    return await MongoUser.findByIdAndUpdate(id, update, options).select("-password");
  }

  static async countDocuments() {
    if (getIsMock()) {
      return mockStore.users.length;
    }
    return await MongoUser.countDocuments();
  }

  static async find(query = {}) {
    if (getIsMock()) {
      return mockStore.users.map(({ password, ...u }) => u);
    }
    return await MongoUser.find(query).select("-password");
  }
}

module.exports = UserModel;
