const { SlashCommandBuilder, ChannelType } = require('discord.js');
const embeds = require('../../utils/embeds');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
    name: 'setmusicchannel',
    aliases: ['setmusicch'],
    description: 'Lock the persistent music panel to a specific channel. Owner only.',
    usage: '<#channel>',
    cooldown: 0,
    ownerOnly: true,
    noPrefix: false,
    slash: new SlashCommandBuilder()
        .setName('setmusicchannel')
        .setDescription('Lock the persistent music panel to a specific channel. Owner only.')
        .addChannelOption((opt) =>
            opt.setName('channel').setDescription('Target text channel').addChannelTypes(ChannelType.GuildText).setRequired(true)
        ),

    async execute(ctx) {
        const channel = ctx.isSlash ? ctx.interaction.options.getChannel('channel') : ctx.message.mentions.channels.first();

        if (!channel) {
            return ctx.reply({ embeds: [embeds.error('Please mention or select a valid text channel.')] });
        }

        await GuildSettings.findOneAndUpdate(
            { guildId: ctx.guild.id },
            { $set: { musicChannelId: channel.id } },
            { upsert: true }
        );

        return ctx.reply({ embeds: [embeds.success(`Music panel channel set to ${channel}.`)] });
    }
};
