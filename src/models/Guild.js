const { Schema, model } = require("mongoose");

/**
 * Per-guild configuration & persistent state.
 * One document per Discord server.
 */
const guildSchema = new Schema(
  {
    guildId: { type: String, required: true, unique: true, index: true },

    prefix: { type: String, default: null }, // null = use global default

    musicChannelId: { type: String, default: null },

    // Permanent "now playing" panel message tracking
    panel: {
      channelId: { type: String, default: null },
      messageId: { type: String, default: null },
    },

    // Persisted playback state, used for auto-resume after a crash/restart
    persistentQueue: {
      voiceChannelId: { type: String, default: null },
      textChannelId: { type: String, default: null },
      volume: { type: Number, default: 70 },
      loopMode: { type: Number, default: 0 }, // 0 off, 1 track, 2 queue
      tracks: { type: [Schema.Types.Mixed], default: [] },
    },

    blacklistedUsers: { type: [String], default: [] },
    whitelistedUsers: { type: [String], default: [] },

    maintenanceMode: { type: Boolean, default: false },

    defaultVolume: { type: Number, default: 70 },
  },
  { timestamps: true }
);

module.exports = model("Guild", guildSchema);
