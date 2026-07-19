const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { successEmbed, errorEmbed, infoEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");
const { hasPermissions, isOwner } = require("../../utils/permissions");
const config = require("../../config/config");

// Tracks active vote-skip sessions: guildId -> Set<userId>
const voteSkips = new Map();

module.exports = {
  name: "skip",
  aliases: ["s"],
  category: "music",
  description: "Skip the current track (vote-based in group listening).",
  noPrefix: true,
  data: new SlashCommandBuilder().setName("skip").setDescription("Skip the current track."),

  async execute(ctx) {
    const { member, guild, reply, author } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    if (!queue?.node.isPlaying()) {
      return reply({ embeds: [errorEmbed("There's nothing playing right now.")] });
    }

    const voiceChannel = queue.channel;
    const listeners = voiceChannel.members.filter((m) => !m.user.bot);

    // DJ / owner / manage-guild bypass — instant skip.
    const canForceSkip = isOwner(author.id) || hasPermissions(member, ["ManageGuild"]) || listeners.size <= 2;

    if (canForceSkip) {
      const skipped = queue.currentTrack;
      queue.node.skip();
      voteSkips.delete(guild.id);
      return reply({ embeds: [successEmbed(`Skipped **${skipped.title}**.`)] });
    }

    // ── Vote-skip flow ───────────────────────────────────────────────
    if (!voteSkips.has(guild.id)) voteSkips.set(guild.id, new Set());
    const votes = voteSkips.get(guild.id);

    if (votes.has(author.id)) {
      return reply({ embeds: [errorEmbed("You've already voted to skip this track.")] });
    }

    votes.add(author.id);
    const required = Math.ceil(listeners.size * config.music.voteSkipThreshold);

    if (votes.size >= required) {
      const skipped = queue.currentTrack;
      queue.node.skip();
      voteSkips.delete(guild.id);
      return reply({ embeds: [successEmbed(`Vote passed — skipped **${skipped.title}**.`)] });
    }

    return reply({
      embeds: [
        infoEmbed(
          `${votes.size}/${required} votes needed to skip **${queue.currentTrack.title}**.`,
          "Vote Skip"
        ),
      ],
    });
  },
};
