/**
 * Nocturne — Slash Command Deployment Script
 * ────────────────────────────────────────────
 * Run with: npm run deploy
 *
 * Registers all commands that export a `data` (SlashCommandBuilder) property.
 * If GUILD_ID is set in .env, commands deploy instantly to that guild (great
 * for development). Otherwise they deploy globally (takes up to 1 hour to
 * propagate across Discord).
 */

const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config/config");
const logger = require("./utils/logger");

async function deployCommands() {
  const commands = [];
  const commandsPath = path.join(__dirname, "commands");
  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".js"));
    for (const file of files) {
      const command = require(path.join(categoryPath, file));
      if (command.data) {
        commands.push(command.data.toJSON());
      }
    }
  }

  const rest = new REST({ version: "10" }).setToken(config.token);

  try {
    logger.info(`Deploying ${commands.length} slash command(s)...`);

    if (config.guildId) {
      await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
      logger.success(`Deployed ${commands.length} command(s) to guild ${config.guildId} (instant).`);
    } else {
      await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
      logger.success(`Deployed ${commands.length} command(s) globally (may take up to 1 hour to propagate).`);
    }
  } catch (error) {
    logger.error(`Failed to deploy commands: ${error.stack || error.message}`);
    process.exit(1);
  }
}

deployCommands();
