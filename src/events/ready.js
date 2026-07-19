const { ActivityType, REST, Routes } = require('discord.js');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
    name: 'clientReady',
    once: true,

    async execute(client) {
        logger.success('Ready', `Logged in as ${client.user.tag}.`);

        client.user.setPresence({
            activities: [{ name: '🎵 /play • Nocturne', type: ActivityType.Listening }],
            status: 'online'
        });

        await registerSlashCommands(client);
    }
};

async function registerSlashCommands(client) {
    if (!client.slashCommandsData?.length) {
        logger.warn('SlashDeploy', 'No slash command data found — skipping registration.');
        return;
    }

    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        if (config.guildId) {
            await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
                body: client.slashCommandsData
            });
            logger.success('SlashDeploy', `Registered ${client.slashCommandsData.length} guild slash commands (instant).`);
        } else {
            await rest.put(Routes.applicationCommands(config.clientId), { body: client.slashCommandsData });
            logger.success('SlashDeploy', `Registered ${client.slashCommandsData.length} global slash commands (may take up to 1h to propagate).`);
        }
    } catch (err) {
        logger.error('SlashDeploy', 'Failed to register slash commands.', err);
    }
}
