const mongoose = require("mongoose");
const config = require("./env");

let isConnected = false;
let isMock = true; // Safe default so in-memory store is active immediately unless Mongo connects

mongoose.set("bufferCommands", false);

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    isConnected = true;
    isMock = false;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    isMock = true;
    console.warn(`[Database] Notice: MongoDB not reachable (${error.message}).`);
    console.log(`[Database] In-Memory Resilient Store is ACTIVE for all models.`);
  }
};

module.exports = {
  connectDB,
  getIsConnected: () => isConnected,
  getIsMock: () => isMock
};
