/**
 * /play — searches and queues a track or playlist from YouTube, Spotify,
 * or SoundCloud, joining the invoker's voice channel if necessary.
 */

const { SlashCommandBuilder } = require('discord.js');
const { QueryType } = require('discord-player');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { validateVoiceState } = require('../../utils/musicHelpers');
const { defaultQueueOptions } = require('../../music/player');
const logger = require('../../utils/logger');

module.exports = {
    name: 'play',
    aliases: ['p'],
    description: 'Play a song or playlist from YouTube, Spotify, or SoundCloud.',
    usage: '<song name or URL>',
    cooldown: config.cooldowns.music,
    noPrefix: true,
    slash: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song or playlist from YouTube, Spotify, or SoundCloud.')
        .addStringOption((opt) =>
            opt.setName('query').setDescription('Song name, YouTube/Spotify/SoundCloud URL, or playlist link').setRequired(true).setAutocomplete(true)
        ),

    async execute(ctx) {
        const query = ctx.getText().trim();

        if (!query) {
            return ctx.reply({ embeds: [embeds.error('Please provide a song name or a URL to play.')] });
        }

        const player = ctx.client.player;
        const check = validateVoiceState(ctx, player);
        if (!check.ok) {
            return ctx.reply({ embeds: [check.embed] });
        }

        await ctx.deferReply();

        try {
            const searchResult = await player.search(query, {
                requestedBy: ctx.user,
                searchEngine: QueryType.AUTO
            });

            if (!searchResult || !searchResult.tracks.length) {
                return ctx.reply({ embeds: [embeds.error(`No results found for **${query}**.`)] });
            }

            const { track } = await player.play(check.voiceChannel, searchResult, {
                nodeOptions: defaultQueueOptions(ctx.channel)
            });

            const isPlaylist = searchResult.playlist && searchResult.tracks.length > 1;

            const embed = embeds.success(
                isPlaylist
                    ? `Queued **${searchResult.tracks.length} tracks** from playlist **${searchResult.playlist.title}**.`
                    : `Queued **[${track.title}](${track.url})** — \`${track.duration}\``,
                'Added to Queue'
            );

            return ctx.reply({ embeds: [embed] });
        } catch (err) {
            logger.error('PlayCommand', 'Failed to play track.', err);
            return ctx.reply({ embeds: [embeds.error('Something went wrong while trying to play that track.')] });
        }
    },

    async autocomplete(interaction) {
        try {
            const focused = interaction.options.getFocused();
            if (!focused) return interaction.respond([]);

            const player = interaction.client.player;
            const results = await player.search(focused, { requestedBy: interaction.user });

            const choices = results.tracks.slice(0, 10).map((t) => ({
                name: `${t.title} — ${t.author}`.slice(0, 100),
                value: t.url.slice(0, 100)
            }));

            await interaction.respond(choices);
        } catch {
            await interaction.respond([]);
        }
    }
};
