/**
 * ─────────────────────────────────────────────
 *  Cooldown Manager
 * ─────────────────────────────────────────────
 * In-memory sliding cooldown tracker keyed by "userId:commandName".
 * Cheap, synchronous, and more than sufficient for per-command rate limiting.
 */

class CooldownManager {
    constructor() {
        /** @type {Map<string, number>} key -> expiry timestamp (ms) */
        this.cooldowns = new Map();
    }

    /**
     * Checks whether a user is currently on cooldown for a command.
     * @returns {number} milliseconds remaining, or 0 if not on cooldown
     */
    check(userId, commandName) {
        const key = `${userId}:${commandName}`;
        const expiry = this.cooldowns.get(key);
        if (!expiry) return 0;

        const remaining = expiry - Date.now();
        if (remaining <= 0) {
            this.cooldowns.delete(key);
            return 0;
        }
        return remaining;
    }

    /** Starts (or restarts) a cooldown window for a user/command pair. */
    trigger(userId, commandName, durationMs) {
        if (!durationMs) return;
        const key = `${userId}:${commandName}`;
        this.cooldowns.set(key, Date.now() + durationMs);
    }
}

module.exports = new CooldownManager();
