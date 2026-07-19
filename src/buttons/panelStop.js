const { guardPanelInteraction } = require('../utils/panelGuard');
const embeds = require('../utils/embeds');
const config = require('../config/config');

module.exports = {
    customId: 'panel_stop',

    async execute(interaction, client) {
        const player = client.player;
        const queue = await guardPanelInteraction(interaction, player);
        if (!queue) return;

        queue.delete();

        await interaction.update({
            embeds: [embeds.success(`${config.emojis.stop} Playback stopped and queue cleared.`)],
            components: []
        });
    }
};
