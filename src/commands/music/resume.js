const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");

module.exports = {
  name: "resume",
  category: "music",
  description: "Resume the currently paused track.",
  noPrefix: true,
  data: new SlashCommandBuilder().setName("resume").setDescription("Resume the currently paused track."),

  async execute(ctx) {
    const { guild, reply } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    if (!queue) return reply({ embeds: [errorEmbed("There's nothing to resume.")] });
    if (!queue.node.isPaused()) return reply({ embeds: [errorEmbed("Playback isn't paused.")] });

    queue.node.resume();
    return reply({ embeds: [successEmbed(`Resumed **${queue.currentTrack.title}**.`)] });
  },
};
