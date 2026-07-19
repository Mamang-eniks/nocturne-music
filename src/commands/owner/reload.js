const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { loadCommands } = require('../../handlers/commandHandler');
const logger = require('../../utils/logger');

module.exports = {
    name: 'reload',
    aliases: [],
    description: 'Hot-reload all commands without restarting the process. Owner only.',
    cooldown: 0,
    ownerOnly: true,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('reload').setDescription('Hot-reload all commands. Owner only.'),

    async execute(ctx) {
        try {
            loadCommands(ctx.client);
            logger.info('ReloadCommand', `Commands reloaded by ${ctx.user.tag}.`);
            return ctx.reply({ embeds: [embeds.success('All commands have been reloaded.')] });
        } catch (err) {
            logger.error('ReloadCommand', 'Failed to reload commands.', err);
            return ctx.reply({ embeds: [embeds.error('Failed to reload commands — check the logs.')] });
        }
    }
};
