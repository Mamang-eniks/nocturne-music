/**
 * ─────────────────────────────────────────────
 *  Anti-Spam Manager
 * ─────────────────────────────────────────────
 * Simple sliding-window rate limiter shared by prefix, slash, and
 * no-prefix command handlers to prevent command flooding.
 */

const config = require('../config/config');

class AntiSpamManager {
    constructor() {
        /** @type {Map<string, number[]>} userId -> array of request timestamps */
        this.hits = new Map();
    }

    /**
     * Registers a new request and reports whether the user has exceeded the limit.
     * @returns {boolean} true if the user IS currently spamming (should be blocked)
     */
    hit(userId) {
        const now = Date.now();
        const { windowMs, maxRequests } = config.antiSpam;

        const timestamps = (this.hits.get(userId) || []).filter((t) => now - t < windowMs);
        timestamps.push(now);
        this.hits.set(userId, timestamps);

        return timestamps.length > maxRequests;
    }
}

module.exports = new AntiSpamManager();
