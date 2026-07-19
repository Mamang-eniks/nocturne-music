/**
 * Shared guard for every music panel button — ensures the clicker is in
 * the same voice channel as Nocturne before allowing playback control.
 */

const embeds = require('../utils/embeds');

async function guardPanelInteraction(interaction, player) {
    const queue = player.nodes.get(interaction.guild.id);

    if (!queue || !queue.currentTrack) {
        await interaction.reply({ embeds: [embeds.error('There is nothing playing right now.')], ephemeral: true });
        return null;
    }

    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel || voiceChannel.id !== queue.channel?.id) {
        await interaction.reply({
            embeds: [embeds.error(`Join ${queue.channel} to control playback.`)],
            ephemeral: true
        });
        return null;
    }

    return queue;
}

module.exports = { guardPanelInteraction };
