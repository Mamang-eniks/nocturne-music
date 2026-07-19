const config = require("../../config/config");
const logger = require("../../utils/logger");

module.exports = {
  name: "voiceStateUpdate",
  async execute(client, oldState, newState) {
    const guild = oldState.guild;
    const queue = client.player.nodes.get(guild.id);
    if (!queue || !queue.channel) return;

    const voiceChannel = queue.channel;

    // Only react to changes in the channel the bot is actually in.
    const relevant = oldState.channelId === voiceChannel.id || newState.channelId === voiceChannel.id;
    if (!relevant) return;

    const nonBotMembers = voiceChannel.members.filter((m) => !m.user.bot);

    if (nonBotMembers.size === 0) {
      logger.music(`Voice channel emptied in ${guild.name} — scheduling auto-disconnect.`);
      setTimeout(() => {
        const stillQueue = client.player.nodes.get(guild.id);
        if (!stillQueue) return;
        const stillEmpty = stillQueue.channel.members.filter((m) => !m.user.bot).size === 0;
        if (stillEmpty) {
          stillQueue.delete();
          logger.music(`Auto-disconnected from ${guild.name} due to empty voice channel.`);
        }
      }, config.music.leaveOnEmptyDelayMs);
    }
  },
};
