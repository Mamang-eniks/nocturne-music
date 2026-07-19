const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { successEmbed, errorEmbed, infoEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");

module.exports = {
  name: "volume",
  aliases: ["vol"],
  category: "music",
  description: "View or set the playback volume (0-100).",
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("View or set the playback volume (0-100).")
    .addIntegerOption((opt) =>
      opt.setName("level").setDescription("Volume level 0-100").setMinValue(0).setMaxValue(100).setRequired(false)
    ),

  async execute(ctx) {
    const { guild, reply, isSlash, args } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    if (!queue) return reply({ embeds: [errorEmbed("There's nothing playing right now.")] });

    const level = isSlash ? ctx.interaction.options.getInteger("level") : parseInt(args[0], 10);

    if (level === null || level === undefined || Number.isNaN(level)) {
      return reply({ embeds: [infoEmbed(`Current volume: **${queue.node.volume}%**`)] });
    }

    if (level < 0 || level > 100) {
      return reply({ embeds: [errorEmbed("Volume must be between 0 and 100.")] });
    }

    queue.node.setVolume(level);
    return reply({ embeds: [successEmbed(`Volume set to **${level}%**.`)] });
  },
};
