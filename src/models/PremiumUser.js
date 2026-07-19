/**
 * PremiumUser — tracks users with elevated (premium) access, e.g. higher
 * volume caps, larger playlists, or priority queueing.
 */

const { Schema, model } = require('mongoose');

const premiumUserSchema = new Schema(
    {
        userId: { type: String, required: true, unique: true, index: true },
        grantedBy: String,
        expiresAt: { type: Date, default: null } // null => permanent
    },
    { timestamps: true }
);

module.exports = model('PremiumUser', premiumUserSchema);
