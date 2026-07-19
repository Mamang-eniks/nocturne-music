const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
    name: 'setprefix',
    aliases: [],
    description: 'Change the prefix command trigger for this server. Owner only.',
    usage: '<new prefix>',
    cooldown: 0,
    ownerOnly: true,
    noPrefix: false,
    slash: new SlashCommandBuilder()
        .setName('setprefix')
        .setDescription('Change the prefix command trigger for this server. Owner only.')
        .addStringOption((opt) => opt.setName('prefix').setDescription('New prefix (max 5 characters)').setRequired(true)),

    async execute(ctx) {
        const prefix = ctx.getOption('prefix', 0);

        if (!prefix || prefix.length > 5) {
            return ctx.reply({ embeds: [embeds.error('Please provide a prefix of 5 characters or fewer.')] });
        }

        await GuildSettings.findOneAndUpdate({ guildId: ctx.guild.id }, { $set: { prefix } }, { upsert: true });

        return ctx.reply({ embeds: [embeds.success(`Prefix updated to \`${prefix}\` for this server.`)] });
    }
};
