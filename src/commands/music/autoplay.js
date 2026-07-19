const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");

module.exports = {
  name: "autoplay",
  category: "music",
  description: "Toggle autoplay — automatically queues related tracks when the queue ends.",
  data: new SlashCommandBuilder().setName("autoplay").setDescription("Toggle autoplay of related tracks."),

  async execute(ctx) {
    const { guild, reply } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    if (!queue) return reply({ embeds: [errorEmbed("There's nothing playing right now.")] });

    const newState = !queue.repeatMode && queue.hasAutoplay ? false : !queue.hasAutoplay;
    queue.setRepeatMode(newState ? 3 /* QueueRepeatMode.AUTOPLAY */ : 0);

    return reply({
      embeds: [successEmbed(`Autoplay is now **${newState ? "enabled" : "disabled"}**.`)],
    });
  },
};
