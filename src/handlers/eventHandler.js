const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

/**
 * Loads client (discord.js) events from events/client and
 * player (discord-player) events from events/player.
 *
 * Client event files export: { name, once?, execute(client, ...args) }
 * Player event files export: { name, execute(client, ...args) } and are
 * bound to client.player.events instead of client itself.
 */
function loadEvents(client) {
  // ── discord.js client events ──────────────────────────────────────
  const clientEventsPath = path.join(__dirname, "..", "events", "client");
  const clientEventFiles = fs.readdirSync(clientEventsPath).filter((f) => f.endsWith(".js"));

  for (const file of clientEventFiles) {
    const event = require(path.join(clientEventsPath, file));
    if (!event.name || !event.execute) {
      logger.warn(`Skipped invalid client event file: ${file}`);
      continue;
    }
    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }
  }
  logger.info(`Loaded ${clientEventFiles.length} client event(s).`);

  // ── discord-player events ─────────────────────────────────────────
  const playerEventsPath = path.join(__dirname, "..", "events", "player");
  const playerEventFiles = fs.readdirSync(playerEventsPath).filter((f) => f.endsWith(".js"));

  for (const file of playerEventFiles) {
    const event = require(path.join(playerEventsPath, file));
    if (!event.name || !event.execute) {
      logger.warn(`Skipped invalid player event file: ${file}`);
      continue;
    }
    client.player.events.on(event.name, (...args) => event.execute(client, ...args));
  }
  logger.info(`Loaded ${playerEventFiles.length} player event(s).`);
}

module.exports = loadEvents;
