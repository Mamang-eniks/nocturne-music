const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { requireActiveQueue, validateVoiceState } = require('../../utils/musicHelpers');

module.exports = {
    name: 'resume',
    aliases: ['unpause'],
    description: 'Resume the currently paused track.',
    cooldown: config.cooldowns.music,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('resume').setDescription('Resume the currently paused track.'),

    async execute(ctx) {
        const player = ctx.client.player;
        const check = validateVoiceState(ctx, player);
        if (!check.ok) return ctx.reply({ embeds: [check.embed] });

        const queue = await requireActiveQueue(ctx, player);
        if (!queue) return;

        if (!queue.node.isPaused()) {
            return ctx.reply({ embeds: [embeds.warning('The track is already playing.')] });
        }

        queue.node.resume();
        return ctx.reply({ embeds: [embeds.success(`${config.emojis.play} Playback resumed.`)] });
    }
};
