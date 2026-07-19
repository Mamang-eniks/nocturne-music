const logger = require("../../utils/logger");
const { errorEmbed } = require("../../utils/embeds");

module.exports = {
  name: "playerError",
  async execute(client, queue, error) {
    logger.error(`Player error in ${queue.guild.name}: ${error.message}`);

    if (queue.metadata?.textChannel) {
      queue.metadata.textChannel
        .send({ embeds: [errorEmbed(`Playback error: \`${error.message}\`. Skipping to the next track.`)] })
        .catch(() => {});
    }
  },
};
