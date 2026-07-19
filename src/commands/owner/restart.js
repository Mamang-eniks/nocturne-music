const { successEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");
const logger = require("../../utils/logger");

module.exports = {
  name: "restart",
  category: "owner",
  description: "Restart the bot process (owner only).",
  ownerOnly: true,
  noPrefix: true,

  async execute(ctx) {
    const { reply } = getContext(ctx);

    await reply({ embeds: [successEmbed("Restarting Nocturne... I'll be back online shortly.")] });
    logger.warn("Restart triggered by owner command. Exiting process.");

    // Railway (and any process manager with restart-on-exit) will spin the
    // bot back up automatically after this clean exit.
    setTimeout(() => process.exit(0), 1000);
  },
};
