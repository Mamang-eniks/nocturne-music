const { Schema, model } = require("mongoose");

const historySchema = new Schema(
  {
    guildId: { type: String, required: true, index: true },
    title: String,
    url: String,
    author: String,
    duration: String,
    requestedBy: String,
    playedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Auto-expire history entries after 30 days to keep the collection lean.
historySchema.index({ playedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = model("History", historySchema);
