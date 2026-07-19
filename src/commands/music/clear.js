const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { requireActiveQueue, validateVoiceState } = require('../../utils/musicHelpers');

module.exports = {
    name: 'clear',
    aliases: ['cq'],
    description: 'Clear every upcoming track from the queue.',
    cooldown: config.cooldowns.music,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('clear').setDescription('Clear every upcoming track from the queue.'),

    async execute(ctx) {
        const player = ctx.client.player;
        const check = validateVoiceState(ctx, player);
        if (!check.ok) return ctx.reply({ embeds: [check.embed] });

        const queue = await requireActiveQueue(ctx, player);
        if (!queue) return;

        const count = queue.tracks.data.length;
        queue.tracks.clear();

        return ctx.reply({ embeds: [embeds.success(`Cleared **${count}** track(s) from the queue.`)] });
    }
};
