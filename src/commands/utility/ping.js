const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');

module.exports = {
    name: 'ping',
    aliases: ['latency'],
    description: 'Check the bot\'s latency and API response time.',
    cooldown: config.cooldowns.default,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('ping').setDescription('Check the bot\'s latency and API response time.'),

    async execute(ctx) {
        const start = Date.now();
        const sent = await ctx.reply({ embeds: [embeds.info('Pinging...')] });
        const roundTrip = Date.now() - start;
        const wsLatency = Math.round(ctx.client.ws.ping);

        const embed = embeds.success(
            [`**Round trip:** ${roundTrip}ms`, `**WebSocket:** ${wsLatency}ms`].join('\n'),
            '🏓 Pong!'
        );

        if (ctx.isSlash) {
            return ctx.interaction.editReply({ embeds: [embed] });
        }
        return sent.edit({ embeds: [embed] });
    }
};
