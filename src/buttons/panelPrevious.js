const embeds = require('../utils/embeds');
const config = require('../config/config');
const { guardPanelInteraction } = require('../utils/panelGuard');
const { upsertPanel } = require('../music/panelManager');

module.exports = {
    customId: 'panel_previous',

    async execute(interaction, client) {
        const player = client.player;
        const queue = await guardPanelInteraction(interaction, player);
        if (!queue) return;

        if (!queue.history.tracks.data.length) {
            return interaction.reply({ embeds: [embeds.error('There is no previous track in history.')], ephemeral: true });
        }

        await queue.history.back();
        await interaction.deferUpdate();
        await upsertPanel(queue);
    }
};
