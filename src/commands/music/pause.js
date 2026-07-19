const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { requireActiveQueue, validateVoiceState } = require('../../utils/musicHelpers');

module.exports = {
    name: 'pause',
    aliases: [],
    description: 'Pause the currently playing track.',
    cooldown: config.cooldowns.music,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('pause').setDescription('Pause the currently playing track.'),

    async execute(ctx) {
        const player = ctx.client.player;
        const check = validateVoiceState(ctx, player);
        if (!check.ok) return ctx.reply({ embeds: [check.embed] });

        const queue = await requireActiveQueue(ctx, player);
        if (!queue) return;

        if (queue.node.isPaused()) {
            return ctx.reply({ embeds: [embeds.warning('The track is already paused.')] });
        }

        queue.node.pause();
        return ctx.reply({ embeds: [embeds.success(`${config.emojis.pause} Playback paused.`)] });
    }
};
