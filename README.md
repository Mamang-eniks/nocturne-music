# 🎧 Nocturne — Premium Discord Music Bot

Nocturne is a production-ready, dark-purple-themed Discord music bot built on
**discord.js v14** and **discord-player**. It supports YouTube, Spotify, and
SoundCloud playback, a persistent interactive "Now Playing" panel with custom
emoji buttons, slash + prefix + owner-only no-prefix commands, MongoDB-backed
guild/user settings, and an anti-crash system built for 24/7 uptime on Railway.

---

## ✨ Features

- Slash commands, prefix commands, and owner-only no-prefix commands
- YouTube, Spotify, and SoundCloud playback via `discord-player` extractors
- Playlist support, autoplay, vote-skip, song history, persistent queue data
- Permanent "Now Playing" panel: progress bar, thumbnail, queue count, volume,
  requester, voice channel — all with custom server emoji buttons
- Auto-reconnect, auto-resume metadata, auto-disconnect on empty VC
- MongoDB persistence: guild settings, blacklist, prefixes, playlists, history
- Owner tools: `eval`, `reload`, `restart`, `maintenance`, `blacklist`,
  `whitelist`, `setprefix`, `setmusicchannel`
- Global anti-crash handlers, per-command cooldowns, permission checks
- Clean modular architecture — easy to extend with new commands or events

---

## 📁 Project Structure

```
nocturne/
├── src/
│   ├── index.js                # Entrypoint — bootstraps everything
│   ├── deploy-commands.js      # Slash command registration script
│   ├── config/config.js        # All tunables: tokens, colors, emojis
│   ├── database/connect.js     # MongoDB connection w/ retry
│   ├── models/                 # Guild, User, Playlist, History schemas
│   ├── handlers/                # Command / event / button loaders
│   ├── utils/                   # Logger, embeds, emojis, format, panel, etc.
│   ├── music/player.js          # discord-player initialization
│   ├── events/client/           # ready, interactionCreate, messageCreate, voiceStateUpdate
│   ├── events/player/           # playerStart, playerEnd, playerError, emptyChannel, disconnect
│   ├── buttons/musicButtons.js  # Panel button interaction logic
│   └── commands/
│       ├── music/               # play, pause, resume, skip, queue, etc.
│       ├── utility/              # help, ping, invite
│       └── owner/                # eval, reload, restart, blacklist, etc.
├── package.json
├── railway.json
├── .env.example
└── .gitignore
```

---

## 🚀 Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Fill in `TOKEN`, `CLIENT_ID`, `GUILD_ID` (optional, for instant dev command
   sync), `MONGO_URI`, `OWNER_ID`, and optionally `GENIUS_API_KEY` for lyrics.

3. **Set up your custom emojis**
   Upload the button icons (play, pause, skip, etc.) to a Discord server the
   bot is in, then copy each emoji's ID into `src/config/config.js` under the
   `emojis` object. Animated emojis use the `<a:name:id>` format.

4. **Deploy slash commands**
   ```bash
   npm run deploy
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

---

## ☁️ Deploying to Railway

1. Push this repository to GitHub.
2. In Railway, create a new project → **Deploy from GitHub repo**.
3. Under **Variables**, add every key from `.env.example`:
   ```
   TOKEN=
   CLIENT_ID=
   GUILD_ID=
   MONGO_URI=
   PREFIX=
   OWNER_ID=
   MUSIC_CHANNEL_ID=
   GENIUS_API_KEY=
   NODE_ENV=production
   ```
4. Railway will detect `railway.json` and use Nixpacks to build automatically.
   The start command is `node src/index.js`.
5. After the first deploy, run `npm run deploy` locally (pointed at the same
   `CLIENT_ID`) once to register your slash commands, or trigger it as a
   one-off Railway command.
6. Every push to your connected branch will auto-redeploy.

**MongoDB:** use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
— whitelist `0.0.0.0/0` (or Railway's egress IPs) so Railway can connect.

---

## 🔧 Extending Nocturne

- **New music command:** drop a file in `src/commands/music/`, export
  `{ name, category, description, data, execute }`. It's auto-loaded on boot.
- **New event:** add a file to `src/events/client/` or `src/events/player/`.
- **New button:** add a module to `src/buttons/` exporting `{ customIds, execute }`.
- **Change theme colors/emojis:** everything lives in `src/config/config.js` —
  no need to touch command logic.

---

## 🛡️ Security Notes

- No-prefix commands only fire for user IDs listed in `OWNER_ID`, and only for
  commands explicitly flagged `noPrefix: true` — this prevents accidental
  triggers on normal messages.
- `!eval` redacts the bot token from output automatically, but it still grants
  full code execution — keep your `OWNER_ID` list restricted to yourself.
- Blacklisted users are checked on both slash and prefix command paths.

---

## 📜 License

MIT — build on top of Nocturne freely.
