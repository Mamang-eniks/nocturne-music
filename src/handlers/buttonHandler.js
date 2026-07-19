const fs = require("fs");
const path = require("path");
const { Collection } = require("discord.js");
const logger = require("../utils/logger");

/**
 * Loads button interaction modules from src/buttons/*.js into
 * client.buttons (customId → handler).
 *
 * Each module exports: { customIds: string[], execute(interaction, client) }
 */
function loadButtons(client) {
  client.buttons = new Collection();

  const buttonsPath = path.join(__dirname, "..", "buttons");
  const files = fs.readdirSync(buttonsPath).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    const module_ = require(path.join(buttonsPath, file));
    if (!module_.customIds || !module_.execute) {
      logger.warn(`Skipped invalid button file: ${file}`);
      continue;
    }
    for (const id of module_.customIds) {
      client.buttons.set(id, module_.execute);
    }
  }

  logger.info(`Loaded ${client.buttons.size} button handler(s).`);
}

module.exports = loadButtons;
