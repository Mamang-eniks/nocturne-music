/**
 * ─────────────────────────────────────────────
 *  NOCTURNE — Central Configuration
 * ─────────────────────────────────────────────
 * Every static or environment-driven setting the bot needs lives here.
 * Nothing outside this file should read process.env directly — that keeps
 * the whole project portable and easy to audit.
 */

require('dotenv').config();

module.exports = {
    // ── Core credentials ──────────────────────────────
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID || null, // null => global slash command registration
    mongoUri: process.env.MONGO_URI,

    // ── Commands ───────────────────────────────────────
    prefix: process.env.PREFIX || '!',
    defaultVolume: 75,
    maxVolume: 150,

    // Comma-separated OWNER_ID env var, e.g. "123,456"
    owners: (process.env.OWNER_ID || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),

    // Optional: lock the persistent music panel / no-prefix commands to one channel
    musicChannelId: process.env.MUSIC_CHANNEL_ID || null,

    environment: process.env.NODE_ENV || 'production',

    // ── Embed color palette (dark purple / premium theme) ─────
    colors: {
        primary: '#6A5CFF',
        secondary: '#2B2141',
        success: '#57F287',
        danger: '#ED4245',
        warning: '#FEE75C',
        dark: '#120C1E'
    },

    // ── Emoji configuration ────────────────────────────
    // Replace the placeholder IDs with your own server's custom emoji IDs.
    // Format for a static emoji:  <:name:id>
    // Format for an animated emoji: <a:name:id>
    emojis: {
        play: '<:play:1000000000000000001>',
        pause: '<:pause:1000000000000000002>',
        stop: '<:stop:1000000000000000003>',
        skip: '<:skip:1000000000000000004>',
        previous: '<:previous:1000000000000000005>',
        queue: '<:queue:1000000000000000006>',
        volume: '<:volume:1000000000000000007>',
        volumeUp: '<:volume_up:1000000000000000008>',
        volumeDown: '<:volume_down:1000000000000000009>',
        loop: '<:loop:1000000000000000010>',
        shuffle: '<:shuffle:1000000000000000011>',
        music: '<:music:1000000000000000012>',
        loading: '<a:loading:1000000000000000013>',
        success: '<:success:1000000000000000014>',
        error: '<:error:1000000000000000015>',
        spotify: '<:spotify:1000000000000000016>',
        youtube: '<:youtube:1000000000000000017>',
        soundcloud: '<:soundcloud:1000000000000000018>',
        arrow: '<:arrow:1000000000000000019>',
        dot: '<:dot:1000000000000000020>'
    },

    // ── Cooldowns (milliseconds) ───────────────────────
    cooldowns: {
        default: 3000,
        music: 2000,
        owner: 0
    },

    // ── Anti-spam ───────────────────────────────────────
    antiSpam: {
        windowMs: 5000,
        maxRequests: 5
    },

    // ── Vote skip ────────────────────────────────────────
    voteSkip: {
        enabled: true,
        threshold: 0.5 // fraction of non-bot listeners required to skip
    },

    // ── Voice behaviour ──────────────────────────────────
    voice: {
        leaveOnEmptyDelay: 30_000, // ms before leaving an empty voice channel
        leaveOnEndDelay: 60_000,   // ms before leaving after the queue ends
        autoResume: true
    }
};
