/**
 * ─────────────────────────────────────────────
 *  Command Handler — recursive command loader
 * ─────────────────────────────────────────────
 * Walks src/commands/<category>/*.js, validates each module's shape, and
 * registers it into client.commands (+ client.aliases). Also builds the
 * flat array of slash command JSON used by the deploy script.
 */

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const logger = require('../utils/logger');

function loadCommands(client) {
    client.commands = new Collection();
    client.aliases = new Collection();
    client.slashCommandsData = [];

    const commandsPath = path.join(__dirname, '..', 'commands');
    const categories = fs.readdirSync(commandsPath).filter((f) =>
        fs.statSync(path.join(commandsPath, f)).isDirectory()
    );

    let loaded = 0;

    for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith('.js'));

        for (const file of files) {
            const filePath = path.join(categoryPath, file);

            try {
                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);

                if (!command?.name || typeof command.execute !== 'function') {
                    logger.warn('CommandHandler', `Skipped invalid command file: ${category}/${file}`);
                    continue;
                }

                command.category = category;
                client.commands.set(command.name, command);

                if (Array.isArray(command.aliases)) {
                    for (const alias of command.aliases) {
                        client.aliases.set(alias, command.name);
                    }
                }

                if (command.slash) {
                    client.slashCommandsData.push(command.slash.toJSON());
                }

                loaded += 1;
            } catch (err) {
                logger.error('CommandHandler', `Failed to load command ${category}/${file}`, err);
            }
        }
    }

    logger.success('CommandHandler', `Loaded ${loaded} commands across ${categories.length} categories.`);
}

module.exports = { loadCommands };
