const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const { requireActiveQueue, validateVoiceState } = require('../../utils/musicHelpers');
const { isOwner, hasPermissions } = require('../../utils/permissions');
const voteSkip = require('../../music/voteSkip');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'skip',
    aliases: ['s', 'next'],
    description: 'Skip the currently playing track.',
    cooldown: config.cooldowns.music,
    noPrefix: true,
    slash: new SlashCommandBuilder().setName('skip').setDescription('Skip the currently playing track.'),

    async execute(ctx) {
        const player = ctx.client.player;
        const check = validateVoiceState(ctx, player);
        if (!check.ok) return ctx.reply({ embeds: [check.embed] });

        const queue = await requireActiveQueue(ctx, player);
        if (!queue) return;

        const track = queue.currentTrack;
        const isRequester = track.requestedBy?.id === ctx.user.id;
        const canForceSkip =
            isRequester || isOwner(ctx.user.id) || hasPermissions(ctx.member, [PermissionFlagsBits.ManageGuild]);

        if (!config.voteSkip.enabled || canForceSkip) {
            queue.node.skip();
            voteSkip.clear(ctx.guild.id);
            return ctx.reply({ embeds: [embeds.success(`${config.emojis.skip} Skipped **${track.title}**.`)] });
        }

        const listenerCount = queue.channel.members.filter((m) => !m.user.bot).size;
        const result = voteSkip.vote(ctx.guild.id, ctx.user.id, listenerCount);

        if (result.alreadyVoted) {
            return ctx.reply({ embeds: [embeds.warning('You already voted to skip this track.')] });
        }

        if (result.passed) {
            queue.node.skip();
            voteSkip.clear(ctx.guild.id);
            return ctx.reply({
                embeds: [embeds.success(`${config.emojis.skip} Vote passed (${result.votes}/${result.required}) — skipped **${track.title}**.`)]
            });
        }

        return ctx.reply({
            embeds: [embeds.info(`Vote to skip: **${result.votes}/${result.required}** votes needed.`, 'Skip Vote Registered')]
        });
    }
};
