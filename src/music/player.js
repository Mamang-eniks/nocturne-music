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
        // Force the WEB client for streaming: the library's default (IOS) expects
        // YouTube to hand back a ready-to-use format URL with no deciphering, but
        // YouTube doesn't always provide that for every format anymore, which
        // throws "Not matching URL for this format found". The WEB client always
        // deciphers the format URL itself instead of assuming one is already present,
        // which is the reliable path now that youtubei.js is pinned to a current
        // version (see the "youtubei.js" entry under "overrides" in package.json).
        //
        // generateWithPoToken solves a different, more insidious problem: WITHOUT a
        // valid PoToken, YouTube can return a format URL that resolves and reports a
        // valid content-length (so nothing throws anywhere in the pipeline) but whose
        // actual bytes are throttled/empty — the track "plays" with zero audible
        // audio and no error. This generates and periodically refreshes a real
        // PoToken via bgutils-js so requests are treated as legitimate.
        // overrideDownloadOptions solves a THIRD, separate bug: the library hardcodes
        // format: "mp4" when picking an audio format, which filters out webm/opus
        // audio-only streams. Many videos only serve audio as webm/opus, so that
        // filter can leave chooseFormat() returning a format with no usable url or
        // cipher data at all — surfacing as "No valid URL to decipher" even after
        // the await fix above. format: "any" removes the container restriction so
        // chooseFormat() can pick from every available audio format.
        // Client selection history (see inline comments below for why this matters):
        //   IOS (library default): expects a ready-to-use format.url with no
        //     decipher step, but often gets format entries with no url at all.
        //   WEB: always deciphers, but requires a genuinely valid PoToken to get
        //     ANY streaming_data back at all — generateWithPoToken relies on
        //     bgutils-js solving a BotGuard challenge via jsdom, which isn't
        //     reliable in a headless server environment like Railway, so WEB
        //     requests were coming back with no streaming_data whatsoever.
        //   TV_EMBEDDED: doesn't require deciphering OR a PoToken, and is the
        //     client currently most consistently able to return full streaming
        //     data + direct format URLs for youtubei.js-based extractors.
        const instance = await player.extractors.register(YoutubeiExtractor, {
            streamOptions: { useClient: 'TV_EMBEDDED' },
            generateWithPoToken: true,
            overrideDownloadOptions: { type: 'audio', quality: 'best', format: 'any' }
        });

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

    // ── Verbose diagnostics ─────────────────────────────
    // Every prior playback fix (encryption, opus, extractor, PoToken) has produced
    // the exact same symptom: reported success, zero audible audio, zero errors
    // anywhere in the normal event handlers above. That pattern means the failure
    // is happening somewhere inside discord-player/@discordjs/voice's internals
    // that we're not otherwise shown — these two debug listeners surface that
    // internal logging (voice connection state transitions, FFmpeg/stream spawn
    // info, packet dispatch) so the real point of failure can be identified from
    // the Railway logs instead of guessed at.
    player.on('debug', (message) => {
        logger.info('PlayerDebug', message);
    });

    player.events.on('debug', (queue, message) => {
        logger.info(`QueueDebug:${queue.guild.name}`, message);
    });

    // Voice connection state transitions happen below discord-player's own error
    // handling — if the underlying UDP/RTP connection to Discord's voice servers
    // never reaches "ready" (or drops silently after), tracks will report as
    // "playing" with zero audio and no error anywhere else in this file.
    player.events.on('connection', (queue) => {
        const connection = queue.connection;
        logger.info(`Voice:${queue.guild.name}`, `Connection object created. Initial state: ${connection?.state?.status}`);

        connection?.on('stateChange', (oldState, newState) => {
            logger.info(`Voice:${queue.guild.name}`, `Connection state changed: ${oldState.status} -> ${newState.status}`);
        });

        connection?.on('error', (err) => {
            logger.error(`Voice:${queue.guild.name}`, 'Voice connection error.', err);
        });
    });

    player.events.on('playerFinish', (queue, track) => {
        logger.music(queue.guild.name, `Finished playing: ${track.title}`);
    });

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
