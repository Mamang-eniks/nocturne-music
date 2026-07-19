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
        play: '<:emoji_24:1528445951574806578>',
        pause: '<:emoji_23:1528445920587415762>',
        stop: '<:emoji_11:1528445051875753994>',
        skip: '<:emoji_16:1528445751485792359>',
        previous: '<:emoji_18:1528445776055894016>',
        queue: '<:emoji_32:1528447923652657323>',
        volume: '<:emoji_33:1528448908920094901>',
        volumeUp: '<:emoji_13:1528445096264208655>',
        volumeDown: '<:emoji_12:1528445076177551543>',
        loop: '<:emoji_19:1528445796838670428>',
        shuffle: '<:emoji_20:1528445821417291866>',
        music: '<:emoji_10:1528445033068494869>',
        loading: '<:emoji_29:1528446754767376394>',
        success: '<:emoji_9:1528445012033929266>',
        error: '<:emoji_15:1528445147455553648>',
        spotify: '<:emoji_28:1528446719421976847>',
        youtube: '<:emoji_21:1528445869660311685>',
        soundcloud: '<:emoji_34:1528449832132546640>',
        arrow: '<:emoji_35:1528450381518999684>',
        dot: '<:emoji_36:1528450402654224384>'
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
