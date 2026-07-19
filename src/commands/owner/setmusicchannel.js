const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");
const GuildModel = require("../../models/Guild");

module.exports = {
  name: "setmusicchannel",
  category: "owner",
  description: "Set the dedicated music commands channel for this server (owner only).",
  ownerOnly: true,
  noPrefix: true,
  data: new SlashCommandBuilder()
    .setName("setmusicchannel")
    .setDescription("Set the dedicated music commands channel for this server (owner only).")
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Text channel for music commands and the now-playing panel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(ctx) {
    const { guild, reply, isSlash, message } = getContext(ctx);

    const channel = isSlash ? ctx.interaction.options.getChannel("channel") : message.mentions.channels.first();

    if (!channel) {
      return reply({ embeds: [errorEmbed("Please mention or select a valid text channel.")] });
    }

    try {
      await GuildModel.findOneAndUpdate({ guildId: guild.id }, { musicChannelId: channel.id }, { upsert: true });
      return reply({ embeds: [successEmbed(`Music channel set to <#${channel.id}>.`)] });
    } catch (error) {
      return reply({ embeds: [errorEmbed(`Failed to set music channel: \`${error.message}\``)] });
    }
  },
};
