const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');

module.exports = {
    name: 'invite',
    aliases: [],
    description: 'Get the link to invite Nocturne to your own server.',
    cooldown: config.cooldowns.default,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('invite').setDescription('Get the link to invite Nocturne to your own server.'),

    async execute(ctx) {
        const permissions = [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak,
            PermissionFlagsBits.UseExternalEmojis
        ].reduce((acc, flag) => acc | flag, 0n);

        const url = `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=${permissions}&scope=bot%20applications.commands`;

        return ctx.reply({ embeds: [embeds.info(`[Click here to invite Nocturne to your server](${url})`, 'Invite Nocturne')] });
    }
};
