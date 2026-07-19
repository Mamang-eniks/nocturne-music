# Nocturne — Premium Discord Music Bot

Nocturne is a production-ready Discord music bot built with **discord.js v14** and **discord-player v6**. It supports slash commands, prefix commands, and owner-only no-prefix commands, backed by MongoDB for persistence, and ships with a permanent, interactive "Now Playing" control panel styled in a dark purple / premium theme.

---

## ✨ Features

- **Slash + Prefix + No-Prefix** command system (no-prefix is owner-only)
- YouTube, Spotify, and SoundCloud playback via `discord-player`
- Persistent, auto-updating "Now Playing" panel with buttons (previous, pause/resume, skip, stop, shuffle, loop, queue, volume ±)
- Queue management: `/queue`, `/remove`, `/clear`, `/shuffle`, `/seek`
- Loop modes: off / track / queue / autoplay
- Personal playlists: `/playlist save|load|list|delete`
- Vote-skip system for non-requesters
- Auto-reconnect, auto-resume, and auto-disconnect on an empty voice channel
- MongoDB-backed guild settings, music history, premium users, and blacklist
- Owner tools: `eval`, `reload`, `restart`, `maintenance`, `blacklist`, `whitelist`, `setprefix`, `setmusicchannel`
- Anti-crash guards, anti-spam rate limiting, and per-command cooldowns
- Fully custom emoji system — swap every icon from one config file

---

## 📁 Project Structure

```
src/
├── commands/
│   ├── music/       → play, pause, resume, skip, previous, stop, queue,
│   │                  nowplaying, loop, shuffle, volume, remove, clear,
│   │                  seek, autoplay, lyrics
│   ├── utility/      → help, ping, playlist, invite
│   ├── owner/        → eval, reload, restart, maintenance, blacklist,
│   │                  whitelist, setprefix, setmusicchannel
│   └── system/       → stats
├── events/           → clientReady, interactionCreate, messageCreate, voiceStateUpdate
├── handlers/         → commandHandler, eventHandler, buttonHandler
├── models/           → GuildSettings, UserPlaylist, MusicHistory, PremiumUser, Blacklist
├── utils/            → logger, embeds, permissions, cooldownManager, antiSpam,
│                        format, context, musicHelpers, panelGuard
├── music/            → player.js (discord-player bootstrap), panelManager.js,
│                        voteSkip.js
├── buttons/          → one file per music-panel button
├── config/           → config.js
├── database/         → connect.js
├── index.js          → entry point
└── deploy-commands.js → optional standalone slash command deploy script
```

---

## 🚀 Setup

### 1. Prerequisites

- Node.js **18.17+**
- A MongoDB database (MongoDB Atlas free tier works fine)
- A Discord application + bot token from the [Discord Developer Portal](https://discord.com/developers/applications)

### 2. Discord application setup

1. Create an application → add a **Bot** user.
2. Under **Bot**, enable the **Message Content Intent** (required for prefix/no-prefix commands).
3. Under **OAuth2 → URL Generator**, select the `bot` and `applications.commands` scopes with `Send Messages`, `Embed Links`, `Connect`, `Speak`, and `Use External Emojis` permissions, then use the generated URL to invite the bot to your server.

### 3. Install dependencies

```bash
npm install
```

> **Optional (recommended):** install `discord-player-youtubei` for the most reliable YouTube playback:
> `npm install discord-player-youtubei`
> Nocturne detects it automatically at startup and falls back to the bundled default extractor if it isn't installed.

### 4. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```env
TOKEN=your-bot-token
CLIENT_ID=your-application-id
GUILD_ID=your-test-guild-id      # optional — instant command sync while developing
MONGO_URI=your-mongodb-uri
PREFIX=!
OWNER_ID=123456789012345678,987654321098765432
MUSIC_CHANNEL_ID=                # optional — locks music commands to one channel
NODE_ENV=production
```

Leave `GUILD_ID` empty in production so slash commands register **globally** instead of to a single test server.

### 5. Configure emojis

Open `src/config/config.js` and replace every placeholder emoji ID under `emojis` with your own server's custom emoji IDs (right-click an emoji in Discord → Copy ID, or type `\:emojiname:` in a message to reveal its full tag).

### 6. Run locally

```bash
npm start
# or, with auto-restart on file changes:
npm run dev
```

Slash commands are registered automatically on every startup — no separate deploy step needed. If you'd like to deploy them without starting the bot, run `npm run deploy`.

---

## ☁️ Deploying to Railway

1. Push this project to a GitHub repository.
2. In Railway, create a **New Project → Deploy from GitHub repo** and select it.
3. Add all the variables from `.env.example` under **Variables** (`TOKEN`, `CLIENT_ID`, `GUILD_ID`, `MONGO_URI`, `PREFIX`, `OWNER_ID`, `MUSIC_CHANNEL_ID`, `NODE_ENV`).
4. Railway will detect `nixpacks.toml` and `railway.json` automatically and run `node src/index.js` as the start command.
5. Every push to your connected branch triggers an automatic redeploy.

The included `nixpacks.toml` ensures the native build tools needed by `@discordjs/opus`/`libsodium-wrappers` are present on Railway's build image, and `ffmpeg-static` bundles its own FFmpeg binary so no extra system package is required.

---

## 🔐 Owner & No-Prefix Commands

Only user IDs listed in `OWNER_ID` (comma-separated) can:

- Use `eval`, `reload`, `restart`, `maintenance`, `blacklist`, `whitelist`, `setprefix`, and `setmusicchannel` (prefix/slash only for the more sensitive ones — `eval`, `blacklist`, `whitelist`, and `setprefix`/`setmusicchannel` are intentionally **not** no-prefix-enabled to avoid accidental triggers in casual chat).
- Trigger **no-prefix** commands: any command flagged `noPrefix: true` (e.g. `play`, `stop`, `skip`, `pause`, `resume`, `reload`, `restart`, `help`, `ping`, and more) can be typed as a bare word with no prefix at all, but **only** by a configured owner. Everyone else must use the slash command or the configured prefix.

---

## 🛠️ Extending Nocturne

- **Add a command:** drop a new file in the matching `src/commands/<category>/` folder following the existing shape (`name`, `description`, `slash`, `execute(ctx)`); it's picked up automatically on the next boot or `!reload`.
- **Add an event:** drop a file in `src/events/` exporting `{ name, once?, execute(...args, client) }`.
- **Add a panel button:** drop a file in `src/buttons/` exporting `{ customId, execute(interaction, client) }`, then wire the button into `buildPanelButtons()` in `src/music/panelManager.js`.

---

## 📄 License

MIT — do whatever you'd like with it.
