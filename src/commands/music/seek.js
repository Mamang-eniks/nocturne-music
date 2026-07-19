const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { requireActiveQueue, validateVoiceState } = require('../../utils/musicHelpers');
const { formatDuration } = require('../../utils/format');

/** Parses "1:30", "90", or "1h2m3s" style input into milliseconds. */
function parseTimeToMs(input) {
    if (!input) return null;

    if (/^\d+$/.test(input)) {
        return parseInt(input, 10) * 1000;
    }

    if (input.includes(':')) {
        const parts = input.split(':').map(Number);
        if (parts.some(Number.isNaN)) return null;

        let seconds = 0;
        for (const part of parts) seconds = seconds * 60 + part;
        return seconds * 1000;
    }

    const match = input.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
    if (match && (match[1] || match[2] || match[3])) {
        const hours = parseInt(match[1] || '0', 10);
        const minutes = parseInt(match[2] || '0', 10);
        const seconds = parseInt(match[3] || '0', 10);
        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }

    return null;
}

module.exports = {
    name: 'seek',
    aliases: [],
    description: 'Seek to a specific timestamp in the current track.',
    usage: '<mm:ss | seconds | 1h2m3s>',
    cooldown: config.cooldowns.music,
    noPrefix: true,
    slash: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Seek to a specific timestamp in the current track.')
        .addStringOption((opt) => opt.setName('timestamp').setDescription('e.g. 1:30, 90, or 1m30s').setRequired(true)),

    async execute(ctx) {
        const player = ctx.client.player;
        const check = validateVoiceState(ctx, player);
        if (!check.ok) return ctx.reply({ embeds: [check.embed] });

        const queue = await requireActiveQueue(ctx, player);
        if (!queue) return;

        const raw = ctx.getOption('timestamp', 0);
        const ms = parseTimeToMs(raw);

        if (ms === null) {
            return ctx.reply({ embeds: [embeds.error('Invalid timestamp. Try `1:30`, `90`, or `1m30s`.')] });
        }

        const durationMs = queue.currentTrack.durationMS;
        if (durationMs && ms > durationMs) {
            return ctx.reply({ embeds: [embeds.error(`That's beyond the track's length (${formatDuration(durationMs)}).`)] });
        }

        try {
            await queue.node.seek(ms);
            return ctx.reply({ embeds: [embeds.success(`Seeked to \`${formatDuration(ms)}\`.`)] });
        } catch {
            return ctx.reply({ embeds: [embeds.error('This track does not support seeking.')] });
        }
    }
};
