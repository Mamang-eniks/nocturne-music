const { guardPanelInteraction } = require('../utils/panelGuard');
const embeds = require('../utils/embeds');
const { truncate } = require('../utils/format');

const PAGE_SIZE = 10;

module.exports = {
    customId: 'panel_queue',

    async execute(interaction, client) {
        const player = client.player;
        const queue = await guardPanelInteraction(interaction, player);
        if (!queue) return;

        const tracks = queue.tracks.toArray().slice(0, PAGE_SIZE);
        const list =
            tracks.map((t, i) => `**${i + 1}.** [${truncate(t.title, 45)}](${t.url}) — \`${t.duration}\``).join('\n') ||
            'No upcoming tracks.';

        const embed = embeds.info(list, 'Up Next').setFooter({ text: `Nocturne • ${queue.tracks.data.length} track(s) queued` });

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
