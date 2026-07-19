const { guardPanelInteraction } = require('../utils/panelGuard');
const { upsertPanel } = require('../music/panelManager');
const voteSkip = require('../music/voteSkip');
const embeds = require('../utils/embeds');
const config = require('../config/config');
const { isOwner, hasPermissions } = require('../utils/permissions');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    customId: 'panel_skip',

    async execute(interaction, client) {
        const player = client.player;
        const queue = await guardPanelInteraction(interaction, player);
        if (!queue) return;

        const track = queue.currentTrack;
        const isRequester = track.requestedBy?.id === interaction.user.id;
        const canForceSkip =
            isRequester || isOwner(interaction.user.id) || hasPermissions(interaction.member, [PermissionFlagsBits.ManageGuild]);

        if (!config.voteSkip.enabled || canForceSkip) {
            queue.node.skip();
            voteSkip.clear(interaction.guild.id);
            await interaction.deferUpdate();
            return upsertPanel(queue);
        }

        const listenerCount = queue.channel.members.filter((m) => !m.user.bot).size;
        const result = voteSkip.vote(interaction.guild.id, interaction.user.id, listenerCount);

        if (result.alreadyVoted) {
            return interaction.reply({ embeds: [embeds.warning('You already voted to skip this track.')], ephemeral: true });
        }

        if (result.passed) {
            queue.node.skip();
            voteSkip.clear(interaction.guild.id);
            await interaction.deferUpdate();
            return upsertPanel(queue);
        }

        return interaction.reply({
            embeds: [embeds.info(`Vote to skip: **${result.votes}/${result.required}** votes needed.`)],
            ephemeral: true
        });
    }
};
