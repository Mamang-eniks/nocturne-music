const { ActivityType } = require("discord.js");
const config = require("../../config/config");
const logger = require("../../utils/logger");
const GuildModel = require("../../models/Guild");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    logger.success(`${config.name} is online as ${client.user.tag}`);
    logger.info(`Serving ${client.guilds.cache.size} guild(s).`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);

    client.user.setPresence({
      activities: [{ name: "premium sound • /play", type: ActivityType.Listening }],
      status: "online",
    });

    // Rotate presence text periodically for a livelier profile.
    const statuses = [
      { name: "premium sound • /play", type: ActivityType.Listening },
      { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching },
      { name: "nocturne.gg", type: ActivityType.Playing },
    ];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % statuses.length;
      client.user.setPresence({ activities: [statuses[i]], status: "online" });
    }, 30_000);

    // ── Auto-resume: reconnect persisted queues after a restart ─────────
    if (GuildModel.db.readyState === 1) {
      try {
        const guildsWithQueues = await GuildModel.find({
          "persistentQueue.tracks.0": { $exists: true },
        });

        for (const guildDoc of guildsWithQueues) {
          logger.music(
            `Found a persisted queue for guild ${guildDoc.guildId} (${guildDoc.persistentQueue.tracks.length} tracks). ` +
              `Auto-resume requires the bot to rejoin manually via /play once a member is in the voice channel.`
          );
          // NOTE: Full auto-rejoin on boot is intentionally conservative — Discord
          // voice connections cannot be re-established without an active gateway
          // session in the target channel. The persisted data remains available
          // so a `/play resume` style command can rebuild the queue on demand.
        }
      } catch (err) {
        logger.error(`Failed to check persisted queues: ${err.message}`);
      }
    }
  },
};
