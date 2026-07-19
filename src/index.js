/**
 * ─────────────────────────────────────────────
 *  NOCTURNE — Entry Point
 * ─────────────────────────────────────────────
 * Boots the Discord client, database connection, discord-player instance,
 * and every handler (commands, events, buttons). Also installs process-level
 * anti-crash guards so a single unhandled error never takes the bot offline.
 */

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config/config');
const logger = require('./utils/logger');
const { connectDatabase } = require('./database/connect');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { loadButtons } = require('./handlers/buttonHandler');
const { initPlayer } = require('./music/player');

// ── Startup validation ──────────────────────────────────
const requiredEnv = ['TOKEN', 'CLIENT_ID'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
    logger.error('Startup', `Missing required environment variable(s): ${missing.join(', ')}. Check your .env / Railway variables.`);
    process.exit(1);
}

// ── Client setup ─────────────────────────────────────────
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel, Partials.Message]
});

client.logger = logger;
client.config = config;

async function bootstrap() {
    logger.info('Startup', 'Booting Nocturne...');

    await connectDatabase();

    loadCommands(client);
    loadEvents(client);
    loadButtons(client);

    await initPlayer(client);

    await client.login(config.token);
}

bootstrap().catch((err) => {
    logger.error('Startup', 'Fatal error during startup — the process will exit.', err);
    process.exit(1);
});

// ── Anti-crash guards ────────────────────────────────────
// These never let a single misbehaving promise or synchronous throw take the
// whole bot down; everything is logged so the root cause is still visible.
process.on('unhandledRejection', (reason) => {
    logger.error('AntiCrash', 'Unhandled promise rejection.', reason instanceof Error ? reason : new Error(String(reason)));
});

process.on('uncaughtException', (err) => {
    logger.error('AntiCrash', 'Uncaught exception.', err);
});

process.on('uncaughtExceptionMonitor', (err) => {
    logger.error('AntiCrash', 'Uncaught exception monitor triggered.', err);
});

process.on('SIGTERM', () => {
    logger.warn('Shutdown', 'Received SIGTERM — shutting down gracefully.');
    client.destroy();
    process.exit(0);
});

module.exports = client;
