const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");

module.exports = {
  name: "remove",
  category: "music",
  description: "Remove a specific track from the queue by position.",
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a specific track from the queue by position.")
    .addIntegerOption((opt) =>
      opt.setName("position").setDescription("Queue position (starting at 1)").setRequired(true).setMinValue(1)
    ),

  async execute(ctx) {
    const { guild, reply, isSlash, args } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    if (!queue?.tracks.size) {
      return reply({ embeds: [errorEmbed("The queue is empty.")] });
    }

    const position = isSlash ? ctx.interaction.options.getInteger("position") : parseInt(args[0], 10);
    if (!position || position < 1 || position > queue.tracks.size) {
      return reply({ embeds: [errorEmbed(`Please provide a valid position between 1 and ${queue.tracks.size}.`)] });
    }

    const track = queue.tracks.at(position - 1);
    queue.node.remove(position - 1);

    return reply({ embeds: [successEmbed(`Removed **${track.title}** from the queue.`)] });
  },
};
