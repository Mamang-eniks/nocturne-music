/**
 * ─────────────────────────────────────────────
 *  Button Handler — loads music panel button modules
 * ─────────────────────────────────────────────
 * Each file in src/buttons exports { customId, execute(interaction, client) }.
 * customId is matched exactly against interaction.customId.
 */

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const logger = require('../utils/logger');

function loadButtons(client) {
    client.buttons = new Collection();

    const buttonsPath = path.join(__dirname, '..', 'buttons');
    const files = fs.readdirSync(buttonsPath).filter((f) => f.endsWith('.js'));

    let loaded = 0;

    for (const file of files) {
        const filePath = path.join(buttonsPath, file);

        try {
            delete require.cache[require.resolve(filePath)];
            const button = require(filePath);

            if (!button?.customId || typeof button.execute !== 'function') {
                logger.warn('ButtonHandler', `Skipped invalid button file: ${file}`);
                continue;
            }

            client.buttons.set(button.customId, button);
            loaded += 1;
        } catch (err) {
            logger.error('ButtonHandler', `Failed to load button ${file}`, err);
        }
    }

    logger.success('ButtonHandler', `Loaded ${loaded} button handlers.`);
}

module.exports = { loadButtons };
