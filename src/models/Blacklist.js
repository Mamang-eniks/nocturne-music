/**
 * Blacklist — users blocked from interacting with the bot, and guilds
 * blocked from using it (e.g. for abuse).
 */

const { Schema, model } = require('mongoose');

const blacklistSchema = new Schema(
    {
        targetId: { type: String, required: true, unique: true, index: true },
        type: { type: String, enum: ['user', 'guild'], required: true },
        reason: { type: String, default: 'No reason provided.' },
        blacklistedBy: String
    },
    { timestamps: true }
);

module.exports = model('Blacklist', blacklistSchema);
