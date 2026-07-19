const { SlashCommandBuilder } = require("discord.js");
const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");
const GuildModel = require("../../models/Guild");

module.exports = {
  name: "maintenance",
  category: "owner",
  description: "Toggle maintenance mode for this server (owner only).",
  ownerOnly: true,
  noPrefix: true,
  data: new SlashCommandBuilder()
    .setName("maintenance")
    .setDescription("Toggle maintenance mode for this server (owner only).")
    .addBooleanOption((opt) => opt.setName("enabled").setDescription("Enable or disable maintenance mode").setRequired(true)),

  async execute(ctx) {
    const { guild, reply, isSlash, args } = getContext(ctx);

    const enabled = isSlash ? ctx.interaction.options.getBoolean("enabled") : args[0]?.toLowerCase() === "on";

    try {
      await GuildModel.findOneAndUpdate(
        { guildId: guild.id },
        { maintenanceMode: enabled },
        { upsert: true }
      );

      return reply({
        embeds: [successEmbed(`Maintenance mode is now **${enabled ? "enabled" : "disabled"}** for this server.`)],
      });
    } catch (error) {
      return reply({ embeds: [errorEmbed(`Failed to update maintenance mode: \`${error.message}\``)] });
    }
  },
};
