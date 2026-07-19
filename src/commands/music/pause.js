const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");

module.exports = {
  name: "pause",
  category: "music",
  description: "Pause the current track.",
  noPrefix: true,
  data: new SlashCommandBuilder().setName("pause").setDescription("Pause the current track."),

  async execute(ctx) {
    const { member, guild, reply } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    if (!queue?.node.isPlaying()) {
      return reply({ embeds: [errorEmbed("There's nothing playing right now.")] });
    }
    if (queue.node.isPaused()) {
      return reply({ embeds: [errorEmbed("Playback is already paused.")] });
    }

    queue.node.pause();
    return reply({ embeds: [successEmbed(`Paused **${queue.currentTrack.title}**.`)] });
  },
};
