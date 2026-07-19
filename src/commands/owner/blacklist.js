const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const Blacklist = require('../../models/Blacklist');
const { isOwner } = require('../../utils/permissions');

module.exports = {
    name: 'blacklist',
    aliases: ['bl'],
    description: 'Blacklist a user or guild from using Nocturne. Owner only.',
    usage: '<user|guild> <id> [reason]',
    cooldown: 0,
    ownerOnly: true,
    noPrefix: false,
    slash: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Blacklist a user or guild from using Nocturne. Owner only.')
        .addStringOption((opt) =>
            opt.setName('type').setDescription('Target type').setRequired(true).addChoices(
                { name: 'User', value: 'user' },
                { name: 'Guild', value: 'guild' }
            )
        )
        .addStringOption((opt) => opt.setName('id').setDescription('User or guild ID').setRequired(true))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason for blacklisting')),

    async execute(ctx) {
        const type = ctx.isSlash ? ctx.interaction.options.getString('type') : ctx.args[0];
        const targetId = ctx.isSlash ? ctx.interaction.options.getString('id') : ctx.args[1];
        const reason = ctx.isSlash ? ctx.interaction.options.getString('reason') : ctx.args.slice(2).join(' ');

        if (!['user', 'guild'].includes(type) || !targetId) {
            return ctx.reply({ embeds: [embeds.error('Usage: `/blacklist <user|guild> <id> [reason]`')] });
        }

        if (type === 'user' && isOwner(targetId)) {
            return ctx.reply({ embeds: [embeds.error('You cannot blacklist a bot owner.')] });
        }

        await Blacklist.findOneAndUpdate(
            { targetId },
            { $set: { type, reason: reason || 'No reason provided.', blacklistedBy: ctx.user.id } },
            { upsert: true }
        );

        return ctx.reply({ embeds: [embeds.success(`Blacklisted ${type} \`${targetId}\`.`)] });
    }
};
