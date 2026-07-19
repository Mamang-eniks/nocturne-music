const logger = require('../utils/logger');

module.exports = {
    name: 'voiceStateUpdate',

    async execute(oldState, newState, client) {
        const player = client.player;
        if (!player) return;

        const guild = oldState.guild || newState.guild;
        const queue = player.nodes.get(guild.id);
        if (!queue) return;

        // If the bot itself was disconnected/kicked from voice, tear down the queue.
        if (oldState.member?.id === client.user.id && oldState.channelId && !newState.channelId) {
            logger.warn('VoiceStateUpdate', `Nocturne was disconnected from voice in ${guild.name}.`);
            queue.delete();
            return;
        }

        // discord-player's built-in leaveOnEmpty (configured per-queue) already
        // handles the "everyone left" case — this listener only needs to cover
        // the bot's own forced disconnection above.
    }
};
