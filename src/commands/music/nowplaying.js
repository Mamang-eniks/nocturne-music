const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { buildPanelEmbed, buildPanelButtons } = require('../../music/panelManager');

module.exports = {
    name: 'nowplaying',
    aliases: ['np'],
    description: 'Show detailed information about the currently playing track.',
    cooldown: config.cooldowns.default,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('nowplaying').setDescription('Show detailed information about the currently playing track.'),

    async execute(ctx) {
        const player = ctx.client.player;
        const queue = player.nodes.get(ctx.guild.id);

        if (!queue || !queue.currentTrack) {
            return ctx.reply({ embeds: [embeds.error('There is nothing playing right now.')] });
        }

        const embed = buildPanelEmbed(queue);
        const components = buildPanelButtons(queue);

        return ctx.reply({ embeds: [embed], components });
    }
};
