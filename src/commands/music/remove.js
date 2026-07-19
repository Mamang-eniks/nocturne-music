const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { requireActiveQueue, validateVoiceState } = require('../../utils/musicHelpers');
const { truncate } = require('../../utils/format');

module.exports = {
    name: 'remove',
    aliases: ['rm'],
    description: 'Remove a track from the queue by its position.',
    usage: '<position>',
    cooldown: config.cooldowns.music,
    noPrefix: true,
    slash: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a track from the queue by its position.')
        .addIntegerOption((opt) => opt.setName('position').setDescription('Track position in the queue').setRequired(true).setMinValue(1)),

    async execute(ctx) {
        const player = ctx.client.player;
        const check = validateVoiceState(ctx, player);
        if (!check.ok) return ctx.reply({ embeds: [check.embed] });

        const queue = await requireActiveQueue(ctx, player);
        if (!queue) return;

        const position = ctx.getIntegerOption('position', 0);
        const index = position - 1;
        const tracks = queue.tracks.toArray();

        if (!position || index < 0 || index >= tracks.length) {
            return ctx.reply({ embeds: [embeds.error(`Please provide a valid position between 1 and ${tracks.length}.`)] });
        }

        const removed = tracks[index];
        queue.removeTrack(removed);

        return ctx.reply({ embeds: [embeds.success(`Removed **${truncate(removed.title, 60)}** from the queue.`)] });
    }
};
