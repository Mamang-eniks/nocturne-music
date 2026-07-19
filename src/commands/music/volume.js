const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { requireActiveQueue, validateVoiceState } = require('../../utils/musicHelpers');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
    name: 'volume',
    aliases: ['vol'],
    description: 'View or set the playback volume.',
    usage: '[0-150]',
    cooldown: config.cooldowns.music,
    noPrefix: true,
    slash: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('View or set the playback volume.')
        .addIntegerOption((opt) =>
            opt.setName('level').setDescription('Volume level (0-150)').setMinValue(0).setMaxValue(config.maxVolume)
        ),

    async execute(ctx) {
        const player = ctx.client.player;
        const check = validateVoiceState(ctx, player);
        if (!check.ok) return ctx.reply({ embeds: [check.embed] });

        const queue = await requireActiveQueue(ctx, player);
        if (!queue) return;

        const level = ctx.getIntegerOption('level', 0);

        if (level === undefined) {
            return ctx.reply({ embeds: [embeds.info(`Current volume is **${queue.node.volume}%**.`)] });
        }

        if (level < 0 || level > config.maxVolume) {
            return ctx.reply({ embeds: [embeds.error(`Volume must be between 0 and ${config.maxVolume}.`)] });
        }

        queue.node.setVolume(level);

        try {
            await GuildSettings.findOneAndUpdate({ guildId: ctx.guild.id }, { $set: { volume: level } }, { upsert: true });
        } catch {
            // Non-fatal — volume still applies for this session even if persistence fails.
        }

        return ctx.reply({ embeds: [embeds.success(`${config.emojis.volume} Volume set to **${level}%**.`)] });
    }
};
