const fs = require("fs");
const path = require("path");
const { Collection } = require("discord.js");
const logger = require("../utils/logger");

/**
 * Recursively loads every command file under src/commands/** into
 * client.commands (by name) and client.aliases (alias → name).
 *
 * Each command module must export:
 * {
 *   name: string,
 *   aliases?: string[],
 *   category: "music" | "utility" | "owner" | "system",
 *   description: string,
 *   data?: SlashCommandBuilder,      // for slash registration
 *   ownerOnly?: boolean,
 *   noPrefix?: boolean,              // allowed as a no-prefix owner command
 *   cooldown?: number,               // seconds
 *   permissions?: PermissionResolvable[],
 *   execute(context): Promise<void> // unified handler, see below
 * }
 */
function loadCommands(client) {
  client.commands = new Collection();
  client.aliases = new Collection();

  const commandsPath = path.join(__dirname, "..", "commands");
  const categories = fs.readdirSync(commandsPath);

  let total = 0;

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);

      if (!command.name) {
        logger.warn(`Skipped invalid command file (missing "name"): ${file}`);
        continue;
      }

      command.category = command.category || category;
      client.commands.set(command.name, command);

      if (Array.isArray(command.aliases)) {
        for (const alias of command.aliases) {
          client.aliases.set(alias, command.name);
        }
      }

      total++;
    }
  }

  logger.info(`Loaded ${total} command(s) across ${categories.length} categories.`);
}

module.exports = loadCommands;
