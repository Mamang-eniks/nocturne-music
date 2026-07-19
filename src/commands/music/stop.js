const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");

module.exports = {
  name: "stop",
  category: "music",
  description: "Stop playback and clear the queue.",
  noPrefix: true,
  data: new SlashCommandBuilder().setName("stop").setDescription("Stop playback and clear the queue."),

  async execute(ctx) {
    const { guild, reply } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    if (!queue) return reply({ embeds: [errorEmbed("There's nothing playing right now.")] });

    queue.delete();
    return reply({ embeds: [successEmbed("Playback stopped and queue cleared.")] });
  },
};
