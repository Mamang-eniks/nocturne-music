const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");

const MODES = { off: 0, track: 1, queue: 2 };
const LABELS = ["Off", "Track", "Queue"];

module.exports = {
  name: "loop",
  category: "music",
  description: "Set the loop mode: off, track, or queue.",
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Set the loop mode.")
    .addStringOption((opt) =>
      opt
        .setName("mode")
        .setDescription("Loop mode")
        .setRequired(true)
        .addChoices({ name: "Off", value: "off" }, { name: "Track", value: "track" }, { name: "Queue", value: "queue" })
    ),

  async execute(ctx) {
    const { guild, reply, isSlash, args } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    if (!queue) return reply({ embeds: [errorEmbed("There's nothing playing right now.")] });

    const modeArg = isSlash ? ctx.interaction.options.getString("mode") : args[0]?.toLowerCase();
    if (!modeArg || !(modeArg in MODES)) {
      return reply({ embeds: [errorEmbed("Please specify a valid mode: `off`, `track`, or `queue`.")] });
    }

    queue.setRepeatMode(MODES[modeArg]);
    return reply({ embeds: [successEmbed(`Loop mode set to **${LABELS[MODES[modeArg]]}**.`)] });
  },
};
