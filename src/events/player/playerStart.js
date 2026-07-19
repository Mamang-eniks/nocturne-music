const logger = require("../../utils/logger");
const { sendOrUpdatePanel } = require("../../utils/panelManager");
const GuildModel = require("../../models/Guild");
const HistoryModel = require("../../models/History");

module.exports = {
  name: "playerStart",
  async execute(client, queue, track) {
    logger.music(`Now playing "${track.title}" in ${queue.guild.name}`);

    await sendOrUpdatePanel(queue, track, GuildModel).catch((err) =>
      logger.error(`Failed to send/update panel: ${err.message}`)
    );

    // Log to history collection (best-effort, never blocks playback)
    HistoryModel.create({
      guildId: queue.guild.id,
      title: track.title,
      url: track.url,
      author: track.author,
      duration: track.duration,
      requestedBy: track.requestedBy?.id || "unknown",
    }).catch(() => {});
  },
};
