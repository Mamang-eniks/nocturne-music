const { guardPanelInteraction } = require('../utils/panelGuard');
const { upsertPanel } = require('../music/panelManager');
const config = require('../config/config');

const STEP = 10;

module.exports = {
    customId: 'panel_volumeup',

    async execute(interaction, client) {
        const player = client.player;
        const queue = await guardPanelInteraction(interaction, player);
        if (!queue) return;

        const newVolume = Math.min(queue.node.volume + STEP, config.maxVolume);
        queue.node.setVolume(newVolume);

        await interaction.deferUpdate();
        await upsertPanel(queue);
    }
};
