/**
 * ─────────────────────────────────────────────
 *  Music Helpers — shared guards for every music command
 * ─────────────────────────────────────────────
 * Keeps commands short by centralizing the repetitive "is the user in a
 * voice channel", "does an active queue exist", "same channel as the bot"
 * checks that almost every /music command needs.
 */

const embeds = require('./embeds');
const { inSameVoiceChannel } = require('./permissions');

/**
 * Validates that the command invoker is in a voice channel and, if the bot
 * is already playing, that they share the same channel.
 * @returns {{ ok: boolean, embed?: import('discord.js').EmbedBuilder }}
 */
function validateVoiceState(ctx, player) {
    const voiceChannel = ctx.member?.voice?.channel;

    if (!voiceChannel) {
        return { ok: false, embed: embeds.error('You need to join a voice channel first.') };
    }

    const existingQueue = player.nodes.get(ctx.guild.id);
    if (existingQueue && existingQueue.channel && !inSameVoiceChannel(ctx.member, existingQueue.channel.id)) {
        return {
            ok: false,
            embed: embeds.error(`I'm already playing in ${existingQueue.channel}. Join that channel to control playback.`)
        };
    }

    return { ok: true, voiceChannel };
}

/**
 * Fetches the active queue for a guild and replies with an error embed if
 * none exists or nothing is currently playing.
 * @returns {import('discord-player').GuildQueue | null}
 */
async function requireActiveQueue(ctx, player) {
    const queue = player.nodes.get(ctx.guild.id);

    if (!queue || !queue.currentTrack) {
        await ctx.reply({ embeds: [embeds.error('There is nothing playing right now.')] });
        return null;
    }

    return queue;
}

module.exports = { validateVoiceState, requireActiveQueue };
