const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { infoEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");
const config = require("../../config/config");

module.exports = {
  name: "invite",
  category: "utility",
  description: "Get the bot's invite link and support server.",
  data: new SlashCommandBuilder().setName("invite").setDescription("Get the bot's invite link and support server."),

  async execute(ctx) {
    const { reply } = getContext(ctx);
    const client = ctx.client;

    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=36718656&scope=bot%20applications.commands`;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Invite Nocturne").setStyle(ButtonStyle.Link).setURL(inviteUrl),
      new ButtonBuilder().setLabel("Support Server").setStyle(ButtonStyle.Link).setURL(config.supportServer)
    );

    return reply({
      embeds: [infoEmbed("Thanks for considering Nocturne for your server! Click below to invite.")],
      components: [row],
    });
  },
};
