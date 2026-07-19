const { guardPanelInteraction } = require('../utils/panelGuard');
const { upsertPanel } = require('../music/panelManager');

module.exports = {
    customId: 'panel_pauseresume',

    async execute(interaction, client) {
        const player = client.player;
        const queue = await guardPanelInteraction(interaction, player);
        if (!queue) return;

        if (queue.node.isPaused()) {
            queue.node.resume();
        } else {
            queue.node.pause();
        }

        await interaction.deferUpdate();
        await upsertPanel(queue);
    }
};
