/**
 * ─────────────────────────────────────────────
 *  Panel Manager — the persistent "Now Playing" control panel
 * ─────────────────────────────────────────────
 * Builds the premium dark-purple embed + button rows shown in the music
 * channel, and keeps a single message updated in place rather than
 * spamming a new one per track.
 */

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

const config = require('../config/config');
const { formatDuration, progressBar, sourceEmoji, truncate } = require('../utils/format');
const GuildSettings = require('../models/GuildSettings');
const logger = require('../utils/logger');

/** Builds the "Now Playing" embed for the given queue/track. */
function buildPanelEmbed(queue) {
    const track = queue.currentTrack;

    if (!track) {
        return new EmbedBuilder()
            .setColor(config.colors.secondary)
            .setTitle(`${config.emojis.music} Nocturne — Idle`)
            .setDescription('No track is currently playing. Queue something with `/play`.')
            .setFooter({ text: 'Nocturne' })
            .setTimestamp();
    }

    const progress = queue.node.getTimestamp();
    const currentMs = progress?.current?.value ?? 0;
    const totalMs = progress?.total?.value ?? track.durationMS ?? 0;

    const bar = progressBar(currentMs, totalMs);
    const elapsed = formatDuration(currentMs);
    const total = track.duration === 'Live' ? 'LIVE' : formatDuration(totalMs);

    const voiceChannel = queue.channel;
    const requestedBy = track.requestedBy;

    return new EmbedBuilder()
        .setColor(config.colors.primary)
        .setAuthor({ name: 'Nocturne — Now Playing', iconURL: track.requestedBy?.client?.user?.displayAvatarURL?.() })
        .setTitle(truncate(track.title, 100))
        .setURL(track.url)
        .setThumbnail(track.thumbnail)
        .setDescription(
            [
                `**Artist:** ${truncate(track.author || 'Unknown', 60)}`,
                `${bar}`,
                `\`${elapsed} / ${total}\``
            ].join('\n')
        )
        .addFields(
            { name: 'Source', value: `${sourceEmoji(track.source)} ${track.source ?? 'Unknown'}`, inline: true },
            { name: 'Queue', value: `${queue.tracks.data.length} song(s)`, inline: true },
            { name: 'Volume', value: `${config.emojis.volume} ${queue.node.volume}%`, inline: true },
            { name: 'Loop Mode', value: `${config.emojis.loop} ${loopModeLabel(queue.repeatMode)}`, inline: true },
            { name: 'Requested By', value: requestedBy ? `${requestedBy}` : 'Unknown', inline: true },
            { name: 'Voice Channel', value: voiceChannel ? `${voiceChannel.name}` : 'Unknown', inline: true }
        )
        .setFooter({ text: 'Nocturne • Premium Music Experience' })
        .setTimestamp();
}

function loopModeLabel(mode) {
    switch (mode) {
        case 1:
            return 'Track';
        case 2:
            return 'Queue';
        case 3:
            return 'Autoplay';
        default:
            return 'Off';
    }
}

/** Builds the two button rows used by the panel. */
function buildPanelButtons(queue) {
    const isPaused = queue.node.isPaused();

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('panel_previous').setEmoji(config.emojis.previous).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('panel_pauseresume')
            .setEmoji(isPaused ? config.emojis.play : config.emojis.pause)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('panel_skip').setEmoji(config.emojis.skip).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('panel_stop').setEmoji(config.emojis.stop).setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('panel_queue').setEmoji(config.emojis.queue).setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('panel_shuffle').setEmoji(config.emojis.shuffle).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('panel_loop').setEmoji(config.emojis.loop).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('panel_volumedown').setEmoji(config.emojis.volumeDown).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('panel_volumeup').setEmoji(config.emojis.volumeUp).setStyle(ButtonStyle.Secondary)
    );

    return [row1, row2];
}

/**
 * Creates the panel message if one doesn't exist yet for this guild, or
 * edits the existing one in place. Persists the message reference in Mongo
 * so it survives bot restarts.
 */
async function upsertPanel(queue) {
    try {
        const channel = queue.metadata?.panelChannel ?? queue.channel;
        if (!channel) return;

        const embed = buildPanelEmbed(queue);
        const components = buildPanelButtons(queue);

        let settings = await GuildSettings.findOne({ guildId: queue.guild.id });
        const messageId = queue.metadata?.panelMessageId ?? settings?.panel?.messageId;

        if (messageId) {
            try {
                const existing = await channel.messages.fetch(messageId);
                await existing.edit({ embeds: [embed], components });
                queue.metadata.panelMessageId = existing.id;
                return;
            } catch {
                // Message was deleted or is otherwise unreachable — fall through to create a new one.
            }
        }

        const sent = await channel.send({ embeds: [embed], components });
        queue.metadata.panelMessageId = sent.id;

        await GuildSettings.findOneAndUpdate(
            { guildId: queue.guild.id },
            { $set: { panel: { channelId: channel.id, messageId: sent.id } } },
            { upsert: true }
        );
    } catch (err) {
        logger.error('PanelManager', 'Failed to upsert music panel.', err);
    }
}

module.exports = { buildPanelEmbed, buildPanelButtons, upsertPanel };
