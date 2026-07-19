const { Player } = require("discord-player");
const { DefaultExtractors } = require("@discord-player/extractor");
const path = require("path");
const config = require("../config/config");
const logger = require("../utils/logger");

/**
 * Creates and configures the global discord-player instance.
 * Attached to client.player and reused everywhere (commands, buttons, events).
 */
async function initializePlayer(client) {
  const player = new Player(client, {
    ytdlOptions: {
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    },
    // ffmpeg-static provides a portable ffmpeg binary — no system install required.
    // discord-player resolves ffmpeg automatically once ffmpeg-static is installed,
    // but we set it explicitly here for reliability on Railway's Nixpacks builder.
    skipFFmpeg: false,
  });

  process.env.FFMPEG_PATH = process.env.FFMPEG_PATH || require("ffmpeg-static");

  // Load YouTube / Spotify / SoundCloud / Apple Music extractors bundled with
  // @discord-player/extractor. This gives Nocturne multi-source support out
  // of the box (YouTube search + playback, Spotify link resolution → YouTube
  // source, SoundCloud, and more).
  await player.extractors.loadMulti(DefaultExtractors);

  logger.success(`discord-player initialized with ${player.extractors.store.size} extractor(s) loaded.`);

  player.events.on("error", (queue, error) => {
    logger.error(`Player error in guild ${queue.guild.name}: ${error.message}`);
  });

  player.events.on("playerError", (queue, error) => {
    logger.error(`Playback error in guild ${queue.guild.name}: ${error.message}`);
  });

  client.player = player;
  return player;
}

module.exports = initializePlayer;
