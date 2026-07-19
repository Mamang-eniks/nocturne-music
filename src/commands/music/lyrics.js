const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { truncate } = require('../../utils/format');
const logger = require('../../utils/logger');

/** Splits lyrics into Discord-embed-safe chunks (max ~4096 chars per description). */
function chunkLyrics(text, size = 4000) {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
    return chunks;
}

module.exports = {
    name: 'lyrics',
    aliases: ['ly'],
    description: 'Fetch lyrics for the current track or a search query.',
    usage: '[song name]',
    cooldown: config.cooldowns.default,
    noPrefix: true,
    slash: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Fetch lyrics for the current track or a search query.')
        .addStringOption((opt) => opt.setName('song').setDescription('Song name (defaults to the current track)')),

    async execute(ctx) {
        await ctx.deferReply();

        const player = ctx.client.player;
        const queue = player.nodes.get(ctx.guild.id);

        let query = ctx.getOption('song', 0);
        if (!query) {
            if (!queue?.currentTrack) {
                return ctx.reply({ embeds: [embeds.error('Provide a song name, or play a track first.')] });
            }
            query = `${queue.currentTrack.author} ${queue.currentTrack.title}`;
        }

        try {
            const [artist, ...titleParts] = query.split('-').map((s) => s.trim());
            const title = titleParts.join('-') || artist;

            const response = await fetch(
                `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title || query)}`
            ).catch(() => null);

            let data = response && response.ok ? await response.json() : null;

            // Fallback: try a plain "artist title" search split if the artist-title guess failed.
            if (!data?.lyrics) {
                const words = query.split(' ');
                const guessArtist = words.slice(0, Math.ceil(words.length / 2)).join(' ');
                const guessTitle = words.slice(Math.ceil(words.length / 2)).join(' ');
                const retry = await fetch(
                    `https://api.lyrics.ovh/v1/${encodeURIComponent(guessArtist)}/${encodeURIComponent(guessTitle)}`
                ).catch(() => null);
                data = retry && retry.ok ? await retry.json() : null;
            }

            if (!data?.lyrics) {
                return ctx.reply({ embeds: [embeds.error(`No lyrics found for **${truncate(query, 60)}**.`)] });
            }

            const chunks = chunkLyrics(data.lyrics.trim());
            const embed = embeds
                .info('', `Lyrics — ${truncate(query, 60)}`)
                .setDescription(chunks[0])
                .setColor(config.colors.primary);

            return ctx.reply({ embeds: [embed] });
        } catch (err) {
            logger.error('LyricsCommand', 'Failed to fetch lyrics.', err);
            return ctx.reply({ embeds: [embeds.error('Something went wrong while fetching lyrics.')] });
        }
    }
};
