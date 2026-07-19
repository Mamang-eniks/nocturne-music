const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { baseEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");
const { emoji } = require("../../utils/emojis");
const { truncate } = require("../../utils/format");

const PAGE_SIZE = 10;

function buildPageEmbed(queue, page, totalPages) {
  const start = page * PAGE_SIZE;
  const tracks = queue.tracks.toArray().slice(start, start + PAGE_SIZE);

  const list = tracks.length
    ? tracks
        .map((t, i) => `**${start + i + 1}.** ${truncate(t.title, 50)} — \`${t.duration}\` (${t.requestedBy})`)
        .join("\n")
    : "The queue is empty. Add songs with `/play`.";

  return baseEmbed()
    .setTitle(`${emoji("queue")} Queue for ${queue.guild.name}`)
    .setDescription(
      `**Now Playing:** ${queue.currentTrack ? truncate(queue.currentTrack.title, 60) : "Nothing"}\n\n${list}`
    )
    .setFooter({ text: `Page ${page + 1}/${totalPages} • ${queue.tracks.size} track(s) queued` });
}

module.exports = {
  name: "queue",
  aliases: ["q"],
  category: "music",
  description: "View the current song queue.",
  data: new SlashCommandBuilder().setName("queue").setDescription("View the current song queue."),

  async execute(ctx) {
    const { guild, reply } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    if (!queue || (!queue.currentTrack && !queue.tracks.size)) {
      return reply({ embeds: [errorEmbed("The queue is currently empty.")] });
    }

    const totalPages = Math.max(1, Math.ceil(queue.tracks.size / PAGE_SIZE));
    let page = 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("queue_prev").setLabel("◀ Previous").setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder()
        .setCustomId("queue_next")
        .setLabel("Next ▶")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(totalPages <= 1)
    );

    const sent = await reply({ embeds: [buildPageEmbed(queue, page, totalPages)], components: [row], fetchReply: true });

    // Lightweight local collector — pagination is scoped to this single reply only.
    const collector = sent.createMessageComponentCollector({ time: 60_000 });

    collector.on("collect", async (i) => {
      if (i.customId === "queue_next") page = Math.min(page + 1, totalPages - 1);
      if (i.customId === "queue_prev") page = Math.max(page - 1, 0);

      row.components[0].setDisabled(page === 0);
      row.components[1].setDisabled(page === totalPages - 1);

      await i.update({ embeds: [buildPageEmbed(queue, page, totalPages)], components: [row] });
    });

    collector.on("end", () => {
      row.components.forEach((c) => c.setDisabled(true));
      sent.edit({ components: [row] }).catch(() => {});
    });
  },
};
