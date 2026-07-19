/**
 * MusicHistory — a rolling log of tracks played per guild, used for
 * the /previous command, analytics, and general accountability.
 */

const { Schema, model } = require('mongoose');

const musicHistorySchema = new Schema(
    {
        guildId: { type: String, required: true, index: true },
        title: String,
        url: String,
        duration: String,
        requestedBy: String,
        source: String,
        playedAt: { type: Date, default: Date.now }
    },
    { timestamps: false }
);

// Auto-expire history entries after 30 days to keep the collection lean.
musicHistorySchema.index({ playedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = model('MusicHistory', musicHistorySchema);
