const { SlashCommandBuilder } = require("discord.js");
const { infoEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");

module.exports = {
  name: "ping",
  category: "utility",
  description: "Check the bot's latency.",
  data: new SlashCommandBuilder().setName("ping").setDescription("Check the bot's latency."),

  async execute(ctx) {
    const { reply } = getContext(ctx);
    const client = ctx.client;

    const sent = await reply({ embeds: [infoEmbed("Pinging...")], fetchReply: true });
    const roundTrip = sent.createdTimestamp - (ctx.isSlash ? ctx.interaction.createdTimestamp : ctx.message.createdTimestamp);

    const embed = infoEmbed(
      [`**Round trip:** ${roundTrip}ms`, `**WebSocket:** ${client.ws.ping}ms`].join("\n"),
      "🏓 Pong!"
    );

    if (ctx.isSlash) {
      await ctx.interaction.editReply({ embeds: [embed] });
    } else {
      await sent.edit({ embeds: [embed] });
    }
  },
};
