const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");

module.exports = {
  name: "shuffle",
  category: "music",
  description: "Shuffle the current queue.",
  data: new SlashCommandBuilder().setName("shuffle").setDescription("Shuffle the current queue."),

  async execute(ctx) {
    const { guild, reply } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    if (!queue?.tracks.size) {
      return reply({ embeds: [errorEmbed("There aren't enough tracks in the queue to shuffle.")] });
    }

    queue.tracks.shuffle();
    return reply({ embeds: [successEmbed("The queue has been shuffled.")] });
  },
};
