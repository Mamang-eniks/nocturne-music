const { SlashCommandBuilder } = require('discord.js');
const { QueueRepeatMode } = require('discord-player');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { requireActiveQueue, validateVoiceState } = require('../../utils/musicHelpers');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
    name: 'autoplay',
    aliases: ['ap'],
    description: 'Toggle autoplay — automatically queue related tracks when the queue ends.',
    cooldown: config.cooldowns.music,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('autoplay').setDescription('Toggle autoplay for related tracks.'),

    async execute(ctx) {
        const player = ctx.client.player;
        const check = validateVoiceState(ctx, player);
        if (!check.ok) return ctx.reply({ embeds: [check.embed] });

        const queue = await requireActiveQueue(ctx, player);
        if (!queue) return;

        const enabling = queue.repeatMode !== QueueRepeatMode.AUTOPLAY;
        queue.setRepeatMode(enabling ? QueueRepeatMode.AUTOPLAY : QueueRepeatMode.OFF);

        try {
            await GuildSettings.findOneAndUpdate({ guildId: ctx.guild.id }, { $set: { autoplay: enabling } }, { upsert: true });
        } catch {
            // Non-fatal.
        }

        return ctx.reply({
            embeds: [embeds.success(`Autoplay is now **${enabling ? 'enabled' : 'disabled'}**.`)]
        });
    }
};
