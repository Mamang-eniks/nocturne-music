const { SlashCommandBuilder } = require("discord.js");
const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");
const GuildModel = require("../../models/Guild");

module.exports = {
  name: "setprefix",
  category: "owner",
  description: "Change the command prefix for this server (owner only).",
  ownerOnly: true,
  noPrefix: true,
  data: new SlashCommandBuilder()
    .setName("setprefix")
    .setDescription("Change the command prefix for this server (owner only).")
    .addStringOption((opt) => opt.setName("prefix").setDescription("New prefix, max 5 characters").setRequired(true)),

  async execute(ctx) {
    const { guild, reply, isSlash, args } = getContext(ctx);

    const newPrefix = isSlash ? ctx.interaction.options.getString("prefix") : args[0];

    if (!newPrefix || newPrefix.length > 5) {
      return reply({ embeds: [errorEmbed("Prefix must be 1-5 characters long.")] });
    }

    try {
      await GuildModel.findOneAndUpdate({ guildId: guild.id }, { prefix: newPrefix }, { upsert: true });
      return reply({ embeds: [successEmbed(`Prefix updated to \`${newPrefix}\` for this server.`)] });
    } catch (error) {
      return reply({ embeds: [errorEmbed(`Failed to update prefix: \`${error.message}\``)] });
    }
  },
};
