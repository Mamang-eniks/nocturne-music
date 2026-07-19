const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { validateVoiceState } = require('../../utils/musicHelpers');

module.exports = {
    name: 'stop',
    aliases: ['leave', 'disconnect', 'dc'],
    description: 'Stop playback, clear the queue, and disconnect Nocturne.',
    cooldown: config.cooldowns.music,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('stop').setDescription('Stop playback, clear the queue, and disconnect Nocturne.'),

    async execute(ctx) {
        const player = ctx.client.player;
        const check = validateVoiceState(ctx, player);
        if (!check.ok) return ctx.reply({ embeds: [check.embed] });

        const queue = player.nodes.get(ctx.guild.id);
        if (!queue) {
            return ctx.reply({ embeds: [embeds.error('There is nothing to stop right now.')] });
        }

        queue.delete();
        return ctx.reply({ embeds: [embeds.success(`${config.emojis.stop} Playback stopped and queue cleared.`)] });
    }
};
