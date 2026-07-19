/**
 * Nocturne — Central Configuration
 * ─────────────────────────────────
 * Every hardcoded value the bot needs lives here, sourced from environment
 * variables so the same codebase runs identically on a local machine or on
 * Railway. Never hardcode secrets directly in this file — use `.env`.
 */

require("dotenv").config();

module.exports = {
  // ── Core Credentials ────────────────────────────────────────────────
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null, // null = deploy commands globally
  mongoUri: process.env.MONGO_URI,

  // ── Bot Identity ─────────────────────────────────────────────────────
  name: "Nocturne",
  version: "1.0.0",
  supportServer: "https://discord.gg/your-invite",

  // ── Commands ─────────────────────────────────────────────────────────
  prefix: process.env.PREFIX || "!",
  owners: (process.env.OWNER_ID || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),

  // Fallback music-only channel (per-guild override stored in DB takes priority)
  musicChannelId: process.env.MUSIC_CHANNEL_ID || null,

  genius: {
    apiKey: process.env.GENIUS_API_KEY || null,
  },

  // ── Theme — Dark Purple / Black Premium Aesthetic ───────────────────
  colors: {
    primary: "#6A5CFF", // signature Nocturne violet
    secondary: "#2B2140", // deep plum / near-black panel background accent
    success: "#57F287",
    danger: "#ED4245",
    warning: "#FEE75C",
    info: "#5865F2",
    dark: "#0E0B16",
  },

  // ── Assets ───────────────────────────────────────────────────────────
  assets: {
    footerIcon: "https://res.cloudinary.com/dnpvgpqka/image/upload/v1784455261/umIdRKQNu8y8hYX-K2kkBKhlkkHU4vT-2J-S6Ct7Js-jkuULBWLVTV_6BggPo6o5qxJIPQ4XLN42hPTjfYrS1walX7fbrD", // replace with hosted Nocturne logo
    thumbnailFallback: "https://res.cloudinary.com/dnpvgpqka/image/upload/v1784455261/umIdRKQNu8y8hYX-K2kkBKhlkkHU4vT-2J-S6Ct7Js-jkuULBWLVTV_6BggPo6o5qxJIPQ4XLN42hPTjfYrS1walX7fbrD",
    bannerImage: "https://res.cloudinary.com/dnpvgpqka/image/upload/v1784455244/009da887-621f-4ca5-8c8e-9c4cad1ed834_nyb1cd.png",
  },

  // ── Custom Emoji System ──────────────────────────────────────────────
  // Replace EMOJI_ID with real IDs from your emoji server.
  // Format: <:name:id> for static, <a:name:id> for animated.
  emojis: {
    play: "<:play:1000000000000000001>",
    pause: "<:pause:1000000000000000002>",
    stop: "<:stop:1000000000000000003>",
    skip: "<:skip:1000000000000000004>",
    previous: "<:previous:1000000000000000005>",
    queue: "<:queue:1000000000000000006>",
    volume: "<:volume:1000000000000000007>",
    volumeUp: "<:volumeup:1000000000000000008>",
    volumeDown: "<:volumedown:1000000000000000009>",
    loop: "<:loop:1000000000000000010>",
    loopTrack: "<:loopone:1000000000000000011>",
    shuffle: "<:shuffle:1000000000000000012>",
    music: "<:music:1000000000000000013>",
    loading: "<a:loading:1000000000000000014>",
    success: "<:success:1000000000000000015>",
    error: "<:error:1000000000000000016>",
    warning: "<:warning:1000000000000000017>",
    arrowRight: "<:arrowright:1000000000000000018>",
    disc: "<a:disc:1000000000000000019>",
    mic: "<:mic:1000000000000000020>",
    crown: "<:crown:1000000000000000021>",
  },

  // ── Behaviour Tuning ─────────────────────────────────────────────────
  music: {
    defaultVolume: 70,
    maxQueueSize: 500,
    leaveOnEmptyDelayMs: 60_000, // auto-disconnect after empty VC
    leaveOnEndDelayMs: 120_000, // auto-disconnect after queue ends
    voteSkipThreshold: 0.5, // 50% of non-bot listeners must vote
    progressBarLength: 18,
  },

  cooldowns: {
    default: 3, // seconds
    play: 3,
    eval: 1,
  },
};
