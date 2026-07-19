const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, default: "" },

    premium: { type: Boolean, default: false },
    premiumExpiresAt: { type: Date, default: null },

    isBlacklisted: { type: Boolean, default: false },
    blacklistReason: { type: String, default: null },

    stats: {
      songsRequested: { type: Number, default: 0 },
      commandsUsed: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
