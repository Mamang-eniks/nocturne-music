const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { requireActiveQueue, validateVoiceState } = require('../../utils/musicHelpers');

module.exports = {
    name: 'shuffle',
    aliases: [],
    description: 'Shuffle the current queue.',
    cooldown: config.cooldowns.music,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('shuffle').setDescription('Shuffle the current queue.'),

    async execute(ctx) {
        const player = ctx.client.player;
        const check = validateVoiceState(ctx, player);
        if (!check.ok) return ctx.reply({ embeds: [check.embed] });

        const queue = await requireActiveQueue(ctx, player);
        if (!queue) return;

        if (queue.tracks.data.length < 2) {
            return ctx.reply({ embeds: [embeds.warning('Not enough tracks in the queue to shuffle.')] });
        }

        queue.tracks.shuffle();

        return ctx.reply({ embeds: [embeds.success(`${config.emojis.shuffle} Queue shuffled.`)] });
    }
};
