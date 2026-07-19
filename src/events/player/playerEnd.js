const logger = require("../../utils/logger");
const { infoEmbed } = require("../../utils/embeds");

module.exports = {
  name: "emptyQueue",
  async execute(client, queue) {
    logger.music(`Queue finished in ${queue.guild.name}. Waiting before disconnect...`);

    if (queue.metadata?.textChannel) {
      queue.metadata.textChannel
        .send({ embeds: [infoEmbed("The queue has finished. I'll leave the voice channel shortly if nothing new is added.")] })
        .catch(() => {});
    }

    if (queue.metadata?.panelMessage) {
      queue.metadata.panelMessage.edit({ components: [] }).catch(() => {});
    }
  },
};
