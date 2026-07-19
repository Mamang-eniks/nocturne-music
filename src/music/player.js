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
    skipFFmpeg: false,
  });

  process.env.FFMPEG_PATH = process.env.FFMPEG_PATH || require("ffmpeg-static");

  // Load YouTube / Spotify / SoundCloud / Apple Music extractors bundled with
  // @discord-player/extractor. Different discord-player releases have exposed
  // slightly different loader APIs (loadMulti / loadDefault / register). We
  // try them in order of preference and fall back gracefully so a minor
  // dependency bump never takes the whole bot down.
  if (typeof player.extractors.loadMulti === "function") {
    await player.extractors.loadMulti(DefaultExtractors);
  } else if (typeof player.extractors.loadDefault === "function") {
    await player.extractors.loadDefault();
  } else {
    for (const extractor of DefaultExtractors) {
      await player.extractors.register(extractor, {});
    }
  }

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
