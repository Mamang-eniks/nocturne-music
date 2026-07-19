/**
 * Nocturne — Main Entrypoint
 * ───────────────────────────
 * Boot order matters here:
 *   1. Create the Discord client (needs the right gateway intents for voice).
 *   2. Connect to MongoDB (non-blocking — bot still runs if DB is unreachable).
 *   3. Initialize discord-player (must happen before player events load).
 *   4. Load commands, events, buttons.
 *   5. Log in.
 *   6. Wire up global anti-crash handlers so one bad promise never kills Railway.
 */

const { Client, GatewayIntentBits, Partials } = require("discord.js");
const config = require("./config/config");
const logger = require("./utils/logger");
const connectDatabase = require("./database/connect");
const initializePlayer = require("./music/player");
const loadCommands = require("./handlers/commandHandler");
const loadEvents = require("./handlers/eventHandler");
const loadButtons = require("./handlers/buttonHandler");

async function bootstrap() {
  if (!config.token || !config.clientId) {
    logger.error("TOKEN and CLIENT_ID must be set in your environment. Exiting.");
    process.exit(1);
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel, Partials.Message],
  });

  // ── Database ──────────────────────────────────────────────────────────
  await connectDatabase();

  // ── Music Engine ──────────────────────────────────────────────────────
  await initializePlayer(client);

  // ── Handlers (order matters: commands/buttons before events that use them) ─
  loadCommands(client);
  loadButtons(client);
  loadEvents(client); // requires client.player to already exist

  // ── Login ─────────────────────────────────────────────────────────────
  await client.login(config.token);

  return client;
}

// ── Anti-Crash System ─────────────────────────────────────────────────────
// Discord bots run 24/7 on Railway — a single unhandled rejection or
// exception should never take the whole process down. We log everything
// instead of letting Node.js exit.
process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason?.stack || reason}`);
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.stack || error.message}`);
});

process.on("uncaughtExceptionMonitor", (error) => {
  logger.error(`Uncaught Exception Monitor: ${error.stack || error.message}`);
});

process.on("SIGTERM", () => {
  logger.warn("Received SIGTERM (Railway redeploy/shutdown). Exiting gracefully.");
  process.exit(0);
});

bootstrap().catch((error) => {
  logger.error(`Fatal error during bootstrap: ${error.stack || error.message}`);
  process.exit(1);
});
