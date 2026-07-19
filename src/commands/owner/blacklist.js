const { SlashCommandBuilder } = require("discord.js");
const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");
const GuildModel = require("../../models/Guild");

module.exports = {
  name: "blacklist",
  category: "owner",
  description: "Blacklist a user from using the bot in this server (owner only).",
  ownerOnly: true,
  noPrefix: true,
  data: new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription("Blacklist a user from using the bot in this server (owner only).")
    .addUserOption((opt) => opt.setName("user").setDescription("User to blacklist").setRequired(true)),

  async execute(ctx) {
    const { guild, reply, isSlash, args, message } = getContext(ctx);

    const targetId = isSlash
      ? ctx.interaction.options.getUser("user").id
      : (message.mentions.users.first()?.id || args[0]);

    if (!targetId) {
      return reply({ embeds: [errorEmbed("Please mention or provide a valid user.")] });
    }

    try {
      await GuildModel.findOneAndUpdate(
        { guildId: guild.id },
        { $addToSet: { blacklistedUsers: targetId } },
        { upsert: true }
      );

      return reply({ embeds: [successEmbed(`<@${targetId}> has been blacklisted from using Nocturne in this server.`)] });
    } catch (error) {
      return reply({ embeds: [errorEmbed(`Failed to blacklist user: \`${error.message}\``)] });
    }
  },
};
