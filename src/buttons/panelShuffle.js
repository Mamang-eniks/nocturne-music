const { guardPanelInteraction } = require('../utils/panelGuard');
const { upsertPanel } = require('../music/panelManager');
const embeds = require('../utils/embeds');

module.exports = {
    customId: 'panel_shuffle',

    async execute(interaction, client) {
        const player = client.player;
        const queue = await guardPanelInteraction(interaction, player);
        if (!queue) return;

        if (queue.tracks.data.length < 2) {
            return interaction.reply({ embeds: [embeds.warning('Not enough tracks in the queue to shuffle.')], ephemeral: true });
        }

        queue.tracks.shuffle();
        await interaction.deferUpdate();
        await upsertPanel(queue);
    }
};
