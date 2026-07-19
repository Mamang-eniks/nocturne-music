/**
 * ─────────────────────────────────────────────
 *  Standalone Slash Command Deployment Script
 * ─────────────────────────────────────────────
 * Nocturne registers slash commands automatically on every startup (see
 * src/events/ready.js), so running this script is optional. It's provided
 * as a convenience for deploying commands without starting the whole bot,
 * e.g. `npm run deploy`.
 */

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('./config/config');
const logger = require('./utils/logger');

function collectSlashData() {
    const commandsPath = path.join(__dirname, 'commands');
    const categories = fs.readdirSync(commandsPath).filter((f) => fs.statSync(path.join(commandsPath, f)).isDirectory());

    const data = [];
    for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith('.js'));

        for (const file of files) {
            const command = require(path.join(categoryPath, file));
            if (command?.slash) data.push(command.slash.toJSON());
        }
    }
    return data;
}

async function main() {
    const commands = collectSlashData();
    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        if (config.guildId) {
            await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
            logger.success('Deploy', `Registered ${commands.length} guild slash commands.`);
        } else {
            await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
            logger.success('Deploy', `Registered ${commands.length} global slash commands.`);
        }
    } catch (err) {
        logger.error('Deploy', 'Failed to deploy slash commands.', err);
        process.exit(1);
    }
}

main();
