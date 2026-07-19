const { QueueRepeatMode } = require('discord-player');
const { guardPanelInteraction } = require('../utils/panelGuard');
const { upsertPanel } = require('../music/panelManager');

const CYCLE = [QueueRepeatMode.OFF, QueueRepeatMode.TRACK, QueueRepeatMode.QUEUE];

module.exports = {
    customId: 'panel_loop',

    async execute(interaction, client) {
        const player = client.player;
        const queue = await guardPanelInteraction(interaction, player);
        if (!queue) return;

        const currentIndex = CYCLE.indexOf(queue.repeatMode);
        const nextMode = CYCLE[(currentIndex + 1) % CYCLE.length];
        queue.setRepeatMode(nextMode);

        await interaction.deferUpdate();
        await upsertPanel(queue);
    }
};
