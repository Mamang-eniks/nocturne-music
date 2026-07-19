/**
 * ─────────────────────────────────────────────
 *  Player Bootstrap — discord-player setup + queue event wiring
 * ─────────────────────────────────────────────
 * This is the musical heart of Nocturne. It initializes the discord-player
 * Player instance, loads its default extractors (YouTube, Spotify bridge,
 * SoundCloud, etc.), and wires every queue-level event to logging, the
 * persistent panel, and MongoDB history.
 */

const { Player } = require('discord-player');
const config = require('../config/config');
const logger = require('../utils/logger');
const embeds = require('../utils/embeds');
const { upsertPanel } = require('./panelManager');
const MusicHistory = require('../models/MusicHistory');
const GuildSettings = require('../models/GuildSettings');

async function initPlayer(client) {
    const player = new Player(client, {
        ffmpegPath: require('ffmpeg-static'),
        skipFFmpeg: false
    });

    // Loads YouTube / SoundCloud / Vimeo / Spotify(-bridged) / Apple Music extractors.
    await player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');
    // discord-player-youtubei uses the youtubei.js library (mimics the real YouTube
    // app's InnerTube API) instead of scraping, which is far more resistant to
    // YouTube's anti-bot changes than the bundled YouTubeExtractor.
    //
    // IMPORTANT: ExtractorExecutionContext#register() does NOT throw on failure —
    // it resolves to `null` if the extractor's activate() call fails (e.g. a
    // transient network/YouTube-side issue). We must check the return value
    // explicitly and fall back to the bundled extractor if it's null, otherwise
    // a failed activation would silently leave the bot with no YouTube support at all.
    try {
        const { YoutubeiExtractor } = require('discord-player-youtubei');
        const instance = await player.extractors.register(YoutubeiExtractor, {});

        if (!instance) {
            throw new Error('YoutubeiExtractor.register() returned null — activation failed.');
        }

        logger.success('Player', 'YoutubeiExtractor registered as the YouTube search/stream provider.');
    } catch (err) {
        logger.warn('Player', 'YoutubeiExtractor failed to activate — falling back to the bundled YouTube extractor.');
        logger.error('Player', 'YoutubeiExtractor registration error:', err);
        await player.extractors.loadDefault();
    }

    client.player = player;

    // ── Track lifecycle ────────────────────────────────
    player.events.on('playerStart', async (queue, track) => {
        logger.music(queue.guild.name, `Now playing: ${track.title} (requested by ${track.requestedBy?.tag ?? 'unknown'})`);

        await upsertPanel(queue);

        try {
            await MusicHistory.create({
                guildId: queue.guild.id,
                title: track.title,
                url: track.url,
                duration: track.duration,
                requestedBy: track.requestedBy?.id,
                source: track.source
            });
        } catch (err) {
            logger.error('MusicHistory', 'Failed to persist track history.', err);
        }
    });

    player.events.on('audioTrackAdd', async (queue) => {
        await upsertPanel(queue);
    });

    player.events.on('audioTracksAdd', async (queue) => {
        await upsertPanel(queue);
    });

    player.events.on('playerSkip', async (queue) => {
        await upsertPanel(queue);
    });

    player.events.on('disconnect', (queue) => {
        logger.music(queue.guild.name, 'Disconnected from the voice channel.');
    });

    player.events.on('emptyChannel', (queue) => {
        logger.music(queue.guild.name, 'Voice channel is empty — leaving after the configured delay.');
        queue.metadata?.textChannel
            ?.send({ embeds: [embeds.info('Everyone left the voice channel — Nocturne is leaving.')] })
            .catch(() => null);
    });

    player.events.on('emptyQueue', async (queue) => {
        logger.music(queue.guild.name, 'Queue finished.');
        queue.metadata?.textChannel
            ?.send({ embeds: [embeds.info('The queue has ended. Add more tracks with `/play`.')] })
            .catch(() => null);
        await upsertPanel(queue);
    });

    // ── Error handling ──────────────────────────────────
    player.events.on('error', (queue, error) => {
        logger.error('Player', `General player error in guild ${queue?.guild?.name}`, error);
    });

    player.events.on('playerError', (queue, error) => {
        logger.error('Player', `Playback error in guild ${queue?.guild?.name}`, error);
        queue.metadata?.textChannel
            ?.send({ embeds: [embeds.error('Playback failed for the current track — skipping to the next one.')] })
            .catch(() => null);
    });

    player.on('error', (error) => {
        logger.error('Player', 'Unhandled discord-player error.', error);
    });

    // ── Auto-resume support ─────────────────────────────
    // When voice connections drop unexpectedly, @discordjs/voice + discord-player
    // will attempt to reconnect automatically (leaveOnEmpty/leaveOnEnd handle the
    // graceful cases below on a per-queue basis at creation time).

    logger.success('Player', 'discord-player initialized with default extractors.');
    return player;
}

/** Default per-queue creation options shared by every /play invocation. */
function defaultQueueOptions(textChannel, panelChannel) {
    return {
        metadata: {
            textChannel,
            panelChannel: panelChannel || textChannel,
            panelMessageId: null
        },
        selfDeaf: true,
        volume: config.defaultVolume,
        leaveOnEmpty: true,
        leaveOnEmptyCooldown: config.voice.leaveOnEmptyDelay,
        leaveOnEnd: true,
        leaveOnEndCooldown: config.voice.leaveOnEndDelay,
        leaveOnStop: false
    };
}

module.exports = { initPlayer, defaultQueueOptions };
