/**
 * ─────────────────────────────────────────────
 *  Vote Skip Manager
 * ─────────────────────────────────────────────
 * Tracks in-progress skip votes per guild so multiple members can vote
 * to skip the current track when the requester isn't the one skipping.
 */

const config = require('../config/config');

class VoteSkipManager {
    constructor() {
        /** @type {Map<string, Set<string>>} guildId -> Set of voter user IDs */
        this.votes = new Map();
    }

    /**
     * Registers a vote and returns the current state.
     * @returns {{ votes: number, required: number, passed: boolean, alreadyVoted: boolean }}
     */
    vote(guildId, userId, listenerCount) {
        if (!this.votes.has(guildId)) this.votes.set(guildId, new Set());
        const set = this.votes.get(guildId);

        const alreadyVoted = set.has(userId);
        if (!alreadyVoted) set.add(userId);

        const required = Math.max(1, Math.ceil(listenerCount * config.voteSkip.threshold));
        const passed = set.size >= required;

        return { votes: set.size, required, passed, alreadyVoted };
    }

    clear(guildId) {
        this.votes.delete(guildId);
    }
}

module.exports = new VoteSkipManager();
