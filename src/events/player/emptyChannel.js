const logger = require("../../utils/logger");
const { infoEmbed } = require("../../utils/embeds");

module.exports = {
  name: "emptyChannel",
  async execute(client, queue) {
    logger.music(`Left ${queue.guild.name} — voice channel was empty.`);
    if (queue.metadata?.textChannel) {
      queue.metadata.textChannel
        .send({ embeds: [infoEmbed("Left the voice channel because it was empty.")] })
        .catch(() => {});
    }
  },
};
