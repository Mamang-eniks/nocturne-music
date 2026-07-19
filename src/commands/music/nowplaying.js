const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { errorEmbed } = require("../../utils/embeds");
const { buildNowPlayingEmbed } = require("../../utils/panelManager");
const { getContext } = require("../../utils/context");

module.exports = {
  name: "nowplaying",
  aliases: ["np"],
  category: "music",
  description: "Show details about the currently playing track.",
  data: new SlashCommandBuilder().setName("nowplaying").setDescription("Show details about the currently playing track."),

  async execute(ctx) {
    const { guild, reply } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    if (!queue?.currentTrack) {
      return reply({ embeds: [errorEmbed("There's nothing playing right now.")] });
    }

    return reply({ embeds: [buildNowPlayingEmbed(queue, queue.currentTrack)] });
  },
};
