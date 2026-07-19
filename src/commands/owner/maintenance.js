const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
    name: 'maintenance',
    aliases: [],
    description: 'Toggle maintenance mode for this server (blocks non-owner command usage). Owner only.',
    cooldown: 0,
    ownerOnly: true,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('maintenance').setDescription('Toggle maintenance mode. Owner only.'),

    async execute(ctx) {
        const settings = await GuildSettings.findOneAndUpdate(
            { guildId: ctx.guild.id },
            [{ $set: { maintenance: { $not: ['$maintenance'] } } }],
            { upsert: true, new: true }
        );

        return ctx.reply({
            embeds: [embeds.success(`Maintenance mode is now **${settings.maintenance ? 'enabled' : 'disabled'}** for this server.`)]
        });
    }
};
