/**
 * ─────────────────────────────────────────────
 *  Database Connection
 * ─────────────────────────────────────────────
 * Connects to MongoDB via mongoose and wires up connection-state logging
 * so deployment issues (bad URI, network ACL, etc.) are obvious in Railway logs.
 */

const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../utils/logger');

async function connectDatabase() {
    if (!config.mongoUri) {
        logger.warn('Database', 'MONGO_URI is not set — persistence features (playlists, history, panel restore) are disabled.');
        return null;
    }

    mongoose.set('strictQuery', true);

    mongoose.connection.on('connected', () => {
        logger.success('Database', 'MongoDB connection established.');
    });

    mongoose.connection.on('error', (err) => {
        logger.error('Database', 'MongoDB connection error.', err);
    });

    mongoose.connection.on('disconnected', () => {
        logger.warn('Database', 'MongoDB disconnected. Mongoose will attempt to reconnect automatically.');
    });

    try {
        await mongoose.connect(config.mongoUri, {
            serverSelectionTimeoutMS: 10_000
        });
        return mongoose.connection;
    } catch (err) {
        logger.error('Database', 'Failed to connect to MongoDB. Continuing without persistence.', err);
        return null;
    }
}

module.exports = { connectDatabase };
