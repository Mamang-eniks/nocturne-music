const { SlashCommandBuilder } = require('discord.js');
const { QueueRepeatMode } = require('discord-player');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { requireActiveQueue, validateVoiceState } = require('../../utils/musicHelpers');

const MODES = {
    off: QueueRepeatMode.OFF,
    track: QueueRepeatMode.TRACK,
    queue: QueueRepeatMode.QUEUE,
    autoplay: QueueRepeatMode.AUTOPLAY
};

module.exports = {
    name: 'loop',
    aliases: ['repeat'],
    description: 'Set the loop mode: off, track, queue, or autoplay.',
    usage: '<off|track|queue|autoplay>',
    cooldown: config.cooldowns.music,
    noPrefix: true,
    slash: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set the loop mode.')
        .addStringOption((opt) =>
            opt
                .setName('mode')
                .setDescription('Loop mode')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'off' },
                    { name: 'Track', value: 'track' },
                    { name: 'Queue', value: 'queue' },
                    { name: 'Autoplay', value: 'autoplay' }
                )
        ),

    async execute(ctx) {
        const player = ctx.client.player;
        const check = validateVoiceState(ctx, player);
        if (!check.ok) return ctx.reply({ embeds: [check.embed] });

        const queue = await requireActiveQueue(ctx, player);
        if (!queue) return;

        const modeInput = (ctx.getOption('mode', 0) || '').toLowerCase();

        if (!(modeInput in MODES)) {
            return ctx.reply({ embeds: [embeds.error('Valid modes are: `off`, `track`, `queue`, `autoplay`.')] });
        }

        queue.setRepeatMode(MODES[modeInput]);

        return ctx.reply({
            embeds: [embeds.success(`${config.emojis.loop} Loop mode set to **${modeInput}**.`)]
        });
    }
};
