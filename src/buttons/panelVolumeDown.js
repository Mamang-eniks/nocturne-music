const { guardPanelInteraction } = require('../utils/panelGuard');
const { upsertPanel } = require('../music/panelManager');

const STEP = 10;

module.exports = {
    customId: 'panel_volumedown',

    async execute(interaction, client) {
        const player = client.player;
        const queue = await guardPanelInteraction(interaction, player);
        if (!queue) return;

        const newVolume = Math.max(queue.node.volume - STEP, 0);
        queue.node.setVolume(newVolume);

        await interaction.deferUpdate();
        await upsertPanel(queue);
    }
};
