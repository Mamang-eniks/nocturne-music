const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { validateVoiceState } = require('../../utils/musicHelpers');

module.exports = {
    name: 'previous',
    aliases: ['back', 'prev'],
    description: 'Play the previous track from history.',
    cooldown: config.cooldowns.music,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('previous').setDescription('Play the previous track from history.'),

    async execute(ctx) {
        const player = ctx.client.player;
        const check = validateVoiceState(ctx, player);
        if (!check.ok) return ctx.reply({ embeds: [check.embed] });

        const queue = player.nodes.get(ctx.guild.id);
        if (!queue) {
            return ctx.reply({ embeds: [embeds.error('There is no active session to go back in.')] });
        }

        if (!queue.history.tracks.data.length) {
            return ctx.reply({ embeds: [embeds.error('There is no previous track in history.')] });
        }

        try {
            await queue.history.back();
            return ctx.reply({ embeds: [embeds.success(`${config.emojis.previous} Playing the previous track.`)] });
        } catch {
            return ctx.reply({ embeds: [embeds.error('Could not go back to the previous track.')] });
        }
    }
};
