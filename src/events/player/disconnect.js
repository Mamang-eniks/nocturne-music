const logger = require("../../utils/logger");
const { warningEmbed } = require("../../utils/embeds");

module.exports = {
  name: "disconnect",
  async execute(client, queue) {
    logger.warn(`Disconnected from voice in ${queue.guild.name} (unexpectedly).`);
    if (queue.metadata?.textChannel) {
      queue.metadata.textChannel
        .send({ embeds: [warningEmbed("I was disconnected from the voice channel. Playback has stopped.")] })
        .catch(() => {});
    }
  },
};
