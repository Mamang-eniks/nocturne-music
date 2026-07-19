/**
 * ─────────────────────────────────────────────
 *  Permissions — owner + member permission helpers
 * ─────────────────────────────────────────────
 */

const config = require('../config/config');

module.exports = {
    /** True if the given user ID is a configured bot owner. */
    isOwner(userId) {
        return config.owners.includes(String(userId));
    },

    /**
     * True if the guild member has ALL of the given Discord permission flags.
     * @param {import('discord.js').GuildMember} member
     * @param {import('discord.js').PermissionResolvable[]} flags
     */
    hasPermissions(member, flags = []) {
        if (!member) return false;
        if (this.isOwner(member.id)) return true;
        return member.permissions.has(flags);
    },

    /** True if the member is in a voice channel. */
    inVoiceChannel(member) {
        return Boolean(member?.voice?.channel);
    },

    /** True if the member shares the bot's current voice channel (or bot isn't connected yet). */
    inSameVoiceChannel(member, botVoiceChannelId) {
        if (!botVoiceChannelId) return true;
        return member?.voice?.channelId === botVoiceChannelId;
    }
};
