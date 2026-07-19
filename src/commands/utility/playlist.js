const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const UserPlaylist = require('../../models/UserPlaylist');
const { validateVoiceState } = require('../../utils/musicHelpers');
const { defaultQueueOptions } = require('../../music/player');
const { QueryType } = require('discord-player');
const logger = require('../../utils/logger');

const MAX_PLAYLISTS_PER_USER = 10;
const MAX_TRACKS_PER_PLAYLIST = 100;

module.exports = {
    name: 'playlist',
    aliases: ['pl'],
    description: 'Save, load, list, or delete your personal playlists.',
    usage: '<save|load|list|delete> [name]',
    cooldown: config.cooldowns.default,
    noPrefix: true,
    slash: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Save, load, list, or delete your personal playlists.')
        .addSubcommand((sub) =>
            sub
                .setName('save')
                .setDescription('Save the current queue as a playlist')
                .addStringOption((opt) => opt.setName('name').setDescription('Playlist name').setRequired(true))
        )
        .addSubcommand((sub) =>
            sub
                .setName('load')
                .setDescription('Load and queue a saved playlist')
                .addStringOption((opt) => opt.setName('name').setDescription('Playlist name').setRequired(true).setAutocomplete(true))
        )
        .addSubcommand((sub) => sub.setName('list').setDescription('List your saved playlists'))
        .addSubcommand((sub) =>
            sub
                .setName('delete')
                .setDescription('Delete a saved playlist')
                .addStringOption((opt) => opt.setName('name').setDescription('Playlist name').setRequired(true).setAutocomplete(true))
        ),

    async execute(ctx) {
        const player = ctx.client.player;
        const sub = ctx.isSlash ? ctx.interaction.options.getSubcommand() : (ctx.args[0] || '').toLowerCase();
        const name = ctx.isSlash ? ctx.interaction.options.getString('name') : ctx.args[1];

        if (!['save', 'load', 'list', 'delete'].includes(sub)) {
            return ctx.reply({ embeds: [embeds.error('Usage: `/playlist <save|load|list|delete> [name]`')] });
        }

        if (sub === 'list') {
            const playlists = await UserPlaylist.find({ userId: ctx.user.id });
            if (!playlists.length) {
                return ctx.reply({ embeds: [embeds.info('You have no saved playlists yet. Use `/playlist save <name>`.')] });
            }
            const list = playlists.map((p) => `• **${p.name}** — ${p.tracks.length} track(s)`).join('\n');
            return ctx.reply({ embeds: [embeds.info(list, 'Your Playlists')] });
        }

        if (!name) {
            return ctx.reply({ embeds: [embeds.error('Please provide a playlist name.')] });
        }

        if (sub === 'save') {
            const queue = player.nodes.get(ctx.guild.id);
            if (!queue || !queue.currentTrack) {
                return ctx.reply({ embeds: [embeds.error('There is nothing playing to save right now.')] });
            }

            const existingCount = await UserPlaylist.countDocuments({ userId: ctx.user.id });
            const alreadyExists = await UserPlaylist.exists({ userId: ctx.user.id, name });

            if (!alreadyExists && existingCount >= MAX_PLAYLISTS_PER_USER) {
                return ctx.reply({ embeds: [embeds.error(`You can only save up to ${MAX_PLAYLISTS_PER_USER} playlists.`)] });
            }

            const allTracks = [queue.currentTrack, ...queue.tracks.toArray()].slice(0, MAX_TRACKS_PER_PLAYLIST);
            const tracks = allTracks.map((t) => ({
                title: t.title,
                url: t.url,
                duration: t.duration,
                thumbnail: t.thumbnail,
                author: t.author
            }));

            await UserPlaylist.findOneAndUpdate(
                { userId: ctx.user.id, name },
                { $set: { tracks } },
                { upsert: true, new: true }
            );

            return ctx.reply({ embeds: [embeds.success(`Saved **${tracks.length} track(s)** to playlist **${name}**.`)] });
        }

        if (sub === 'delete') {
            const result = await UserPlaylist.findOneAndDelete({ userId: ctx.user.id, name });
            if (!result) {
                return ctx.reply({ embeds: [embeds.error(`No playlist named **${name}** was found.`)] });
            }
            return ctx.reply({ embeds: [embeds.success(`Deleted playlist **${name}**.`)] });
        }

        if (sub === 'load') {
            const playlist = await UserPlaylist.findOne({ userId: ctx.user.id, name });
            if (!playlist || !playlist.tracks.length) {
                return ctx.reply({ embeds: [embeds.error(`No playlist named **${name}** was found.`)] });
            }

            const check = validateVoiceState(ctx, player);
            if (!check.ok) return ctx.reply({ embeds: [check.embed] });

            await ctx.deferReply();

            try {
                let queued = 0;
                for (const track of playlist.tracks) {
                    const searchResult = await player.search(track.url || track.title, {
                        requestedBy: ctx.user,
                        searchEngine: QueryType.AUTO
                    });
                    if (!searchResult.tracks.length) continue;

                    await player.play(check.voiceChannel, searchResult.tracks[0], {
                        nodeOptions: defaultQueueOptions(ctx.channel)
                    });
                    queued += 1;
                }

                return ctx.reply({ embeds: [embeds.success(`Queued **${queued}/${playlist.tracks.length}** track(s) from **${name}**.`)] });
            } catch (err) {
                logger.error('PlaylistCommand', 'Failed to load playlist.', err);
                return ctx.reply({ embeds: [embeds.error('Something went wrong while loading that playlist.')] });
            }
        }
    },

    async autocomplete(interaction) {
        try {
            const focused = interaction.options.getFocused();
            const playlists = await UserPlaylist.find({ userId: interaction.user.id }).limit(25);
            const choices = playlists
                .filter((p) => p.name.toLowerCase().includes((focused || '').toLowerCase()))
                .map((p) => ({ name: p.name, value: p.name }));
            await interaction.respond(choices.slice(0, 25));
        } catch {
            await interaction.respond([]);
        }
    }
};
