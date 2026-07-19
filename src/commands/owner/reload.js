const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");
const loadCommands = require("../../handlers/commandHandler");

module.exports = {
  name: "reload",
  category: "owner",
  description: "Hot-reload all commands without restarting the bot (owner only).",
  ownerOnly: true,
  noPrefix: true,

  async execute(ctx) {
    const { reply } = getContext(ctx);
    const client = ctx.client;

    try {
      loadCommands(client);
      return reply({ embeds: [successEmbed(`Reloaded ${client.commands.size} command(s) successfully.`)] });
    } catch (error) {
      return reply({ embeds: [errorEmbed(`Failed to reload commands: \`${error.message}\``)] });
    }
  },
};
