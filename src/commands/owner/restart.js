const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
    name: 'restart',
    aliases: [],
    description: 'Restart the bot process. Owner only.',
    cooldown: 0,
    ownerOnly: true,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('restart').setDescription('Restart the bot process. Owner only.'),

    async execute(ctx) {
        await ctx.reply({ embeds: [embeds.warning('Restarting Nocturne...')] });
        logger.warn('RestartCommand', `Restart triggered by ${ctx.user.tag}.`);

        // Exit with a non-zero code so Railway's "ON_FAILURE" restart policy
        // (configured in railway.json) automatically brings the process back up.
        setTimeout(() => process.exit(1), 500);
    }
};
