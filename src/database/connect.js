const mongoose = require("mongoose");
const config = require("../config/config");
const logger = require("../utils/logger");

/**
 * Connects to MongoDB with automatic retry on failure.
 * Called once from index.js during bootstrap.
 */
async function connectDatabase(retries = 5, delayMs = 5000) {
  if (!config.mongoUri) {
    logger.warn("MONGO_URI is not set — database features will be disabled.");
    return false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 10_000,
      });
      logger.success(`Connected to MongoDB (attempt ${attempt}/${retries}).`);

      mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB connection lost. Attempting to reconnect...");
      });

      mongoose.connection.on("reconnected", () => {
        logger.success("MongoDB reconnected.");
      });

      return true;
    } catch (error) {
      logger.error(`MongoDB connection attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        logger.error("All MongoDB connection attempts exhausted. Continuing without DB.");
        return false;
      }
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

module.exports = connectDatabase;
