const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");

module.exports = {
  name: "previous",
  aliases: ["back"],
  category: "music",
  description: "Play the previous track again.",
  data: new SlashCommandBuilder().setName("previous").setDescription("Play the previous track again."),

  async execute(ctx) {
    const { guild, reply } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    if (!queue) return reply({ embeds: [errorEmbed("There's nothing playing right now.")] });
    if (!queue.history.tracks.size) {
      return reply({ embeds: [errorEmbed("There's no previous track in history.")] });
    }

    await queue.history.back();
    return reply({ embeds: [successEmbed("Playing the previous track.")] });
  },
};
