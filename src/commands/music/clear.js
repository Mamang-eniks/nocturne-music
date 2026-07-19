const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");

module.exports = {
  name: "clear",
  category: "music",
  description: "Clear all upcoming tracks from the queue (keeps the current track playing).",
  data: new SlashCommandBuilder().setName("clear").setDescription("Clear all upcoming tracks from the queue."),

  async execute(ctx) {
    const { guild, reply } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    if (!queue?.tracks.size) {
      return reply({ embeds: [errorEmbed("The queue is already empty.")] });
    }

    queue.tracks.clear();
    return reply({ embeds: [successEmbed("Cleared all upcoming tracks from the queue.")] });
  },
};
