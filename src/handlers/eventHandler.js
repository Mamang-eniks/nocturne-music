/**
 * ─────────────────────────────────────────────
 *  Event Handler — recursive event loader
 * ─────────────────────────────────────────────
 * Loads every file in src/events and binds it to the client via
 * client.once/client.on depending on the exported `once` flag.
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

function loadEvents(client) {
    const eventsPath = path.join(__dirname, '..', 'events');
    const files = fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'));

    let loaded = 0;

    for (const file of files) {
        const filePath = path.join(eventsPath, file);

        try {
            delete require.cache[require.resolve(filePath)];
            const event = require(filePath);

            if (!event?.name || typeof event.execute !== 'function') {
                logger.warn('EventHandler', `Skipped invalid event file: ${file}`);
                continue;
            }

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }

            loaded += 1;
        } catch (err) {
            logger.error('EventHandler', `Failed to load event ${file}`, err);
        }
    }

    logger.success('EventHandler', `Loaded ${loaded} events.`);
}

module.exports = { loadEvents };
