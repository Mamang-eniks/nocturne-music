const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");

/**
 * Parses a timestamp string like "1:23", "01:02:03", or plain seconds "90"
 * into milliseconds.
 */
function parseTimestamp(input) {
  if (/^\d+$/.test(input)) return parseInt(input, 10) * 1000;

  const parts = input.split(":").map(Number);
  if (parts.some(Number.isNaN)) return null;

  let seconds = 0;
  for (const part of parts) seconds = seconds * 60 + part;
  return seconds * 1000;
}

module.exports = {
  name: "seek",
  category: "music",
  description: "Seek to a specific timestamp in the current track (e.g. 1:23).",
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Seek to a specific timestamp in the current track.")
    .addStringOption((opt) => opt.setName("timestamp").setDescription("e.g. 1:23 or 90").setRequired(true)),

  async execute(ctx) {
    const { guild, reply, isSlash, args } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    if (!queue?.currentTrack) {
      return reply({ embeds: [errorEmbed("There's nothing playing right now.")] });
    }

    const raw = isSlash ? ctx.interaction.options.getString("timestamp") : args[0];
    const ms = parseTimestamp(raw || "");

    if (ms === null || ms < 0) {
      return reply({ embeds: [errorEmbed("Please provide a valid timestamp, e.g. `1:23` or `90`.")] });
    }

    if (ms > queue.currentTrack.durationMS) {
      return reply({ embeds: [errorEmbed("That timestamp is longer than the track itself.")] });
    }

    await queue.node.seek(ms);
    return reply({ embeds: [successEmbed(`Seeked to \`${raw}\`.`)] });
  },
};
