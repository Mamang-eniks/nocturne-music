const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { formatDuration, truncate } = require('../../utils/format');

const PAGE_SIZE = 10;

module.exports = {
    name: 'queue',
    aliases: ['q'],
    description: 'Show the current music queue.',
    cooldown: config.cooldowns.default,
    noPrefix: true,
    slash: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current music queue.')
        .addIntegerOption((opt) => opt.setName('page').setDescription('Page number').setMinValue(1)),

    async execute(ctx) {
        const player = ctx.client.player;
        const queue = player.nodes.get(ctx.guild.id);

        if (!queue || !queue.currentTrack) {
            return ctx.reply({ embeds: [embeds.error('There is nothing playing right now.')] });
        }

        const page = Math.max((ctx.getIntegerOption('page') || 1) - 1, 0);
        const tracks = queue.tracks.toArray();
        const totalPages = Math.max(Math.ceil(tracks.length / PAGE_SIZE), 1);
        const clampedPage = Math.min(page, totalPages - 1);

        const slice = tracks.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);

        const list =
            slice
                .map((t, i) => `**${clampedPage * PAGE_SIZE + i + 1}.** [${truncate(t.title, 45)}](${t.url}) — \`${t.duration}\` • ${t.requestedBy}`)
                .join('\n') || 'No upcoming tracks — this is the last one in the queue.';

        const current = queue.currentTrack;
        const embed = embeds
            .info('', 'Music Queue')
            .setDescription(
                [
                    `${config.emojis.music} **Now Playing:** [${truncate(current.title, 50)}](${current.url}) — \`${formatDuration(
                        queue.node.getTimestamp()?.current?.value ?? 0
                    )} / ${current.duration}\``,
                    '',
                    '**Up Next:**',
                    list
                ].join('\n')
            )
            .setFooter({ text: `Nocturne • Page ${clampedPage + 1}/${totalPages} • ${tracks.length} track(s) queued` });

        return ctx.reply({ embeds: [embed] });
    }
};
