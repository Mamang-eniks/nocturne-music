const { SlashCommandBuilder, version: djsVersion } = require('discord.js');
const os = require('os');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { formatDuration } = require('../../utils/format');

module.exports = {
    name: 'stats',
    aliases: ['botinfo', 'about'],
    description: 'Show Nocturne\'s system stats and health.',
    cooldown: config.cooldowns.default,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('stats').setDescription('Show Nocturne\'s system stats and health.'),

    async execute(ctx) {
        const client = ctx.client;
        const player = client.player;

        const activeQueues = player?.nodes?.cache?.size ?? 0;
        const memoryUsedMb = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
        const uptime = formatDuration(client.uptime);

        const embed = embeds
            .info('', `${config.emojis.music} Nocturne — System Stats`)
            .addFields(
                { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
                { name: 'Active Sessions', value: `${activeQueues}`, inline: true },
                { name: 'Uptime', value: uptime, inline: true },
                { name: 'Memory Usage', value: `${memoryUsedMb} MB`, inline: true },
                { name: 'Platform', value: `${os.platform()} (${os.arch()})`, inline: true },
                { name: 'discord.js', value: `v${djsVersion}`, inline: true },
                { name: 'Node.js', value: process.version, inline: true },
                { name: 'WebSocket Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
                { name: 'Environment', value: config.environment, inline: true }
            );

        return ctx.reply({ embeds: [embed] });
    }
};
