const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const Blacklist = require('../../models/Blacklist');

module.exports = {
    name: 'whitelist',
    aliases: ['wl', 'unblacklist'],
    description: 'Remove a user or guild from the blacklist. Owner only.',
    usage: '<id>',
    cooldown: 0,
    ownerOnly: true,
    noPrefix: false,
    slash: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Remove a user or guild from the blacklist. Owner only.')
        .addStringOption((opt) => opt.setName('id').setDescription('User or guild ID').setRequired(true)),

    async execute(ctx) {
        const targetId = ctx.getOption('id', 0);
        if (!targetId) return ctx.reply({ embeds: [embeds.error('Usage: `/whitelist <id>`')] });

        const result = await Blacklist.findOneAndDelete({ targetId });
        if (!result) {
            return ctx.reply({ embeds: [embeds.error(`\`${targetId}\` is not currently blacklisted.`)] });
        }

        return ctx.reply({ embeds: [embeds.success(`Removed \`${targetId}\` from the blacklist.`)] });
    }
};
