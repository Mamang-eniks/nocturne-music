/**
 * GuildSettings — per-server configuration persisted in MongoDB.
 * Covers custom prefix, volume, music channel lock, the persistent
 * music panel message reference, and basic feature toggles.
 */

const { Schema, model } = require('mongoose');

const guildSettingsSchema = new Schema(
    {
        guildId: { type: String, required: true, unique: true, index: true },

        prefix: { type: String, default: null }, // null => fall back to global config prefix
        musicChannelId: { type: String, default: null },
        volume: { type: Number, default: 75 },

        // Persistent music panel reference so it can be restored/edited after a restart
        panel: {
            channelId: { type: String, default: null },
            messageId: { type: String, default: null }
        },

        autoplay: { type: Boolean, default: false },
        loopMode: { type: String, enum: ['off', 'track', 'queue'], default: 'off' },

        maintenance: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = model('GuildSettings', guildSettingsSchema);
