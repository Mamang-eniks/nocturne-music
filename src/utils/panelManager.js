const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const config = require("../config/config");
const { emoji } = require("./emojis");
const { progressBar, truncate } = require("./format");

const LOOP_LABELS = ["Off", "Track", "Queue"];

/**
 * Builds the premium "Now Playing" embed for the given queue/track.
 */
function buildNowPlayingEmbed(queue, track) {
  const progress = queue.node.isPlaying()
    ? progressBar(queue.node.getTimestamp()?.current.value || 0, track.durationMS)
    : progressBar(0, track.durationMS);

  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setAuthor({ name: "Nocturne — Now Playing", iconURL: config.assets.footerIcon })
    .setTitle(truncate(track.title, 100))
    .setURL(track.url)
    .setThumbnail(track.thumbnail || config.assets.thumbnailFallback)
    .setDescription(
      [
        `${emoji("mic")} **Artist:** ${track.author || "Unknown"}`,
        `${emoji("disc")} **Source:** ${track.source || track.raw?.source || "Unknown"}`,
        "",
        progress,
      ].join("\n")
    )
    .addFields(
      { name: "Requested By", value: `${track.requestedBy || "Unknown"}`, inline: true },
      { name: "Voice Channel", value: `${queue.channel ? `<#${queue.channel.id}>` : "—"}`, inline: true },
      { name: "Queue", value: `${queue.tracks.size} song(s)`, inline: true },
      { name: "Volume", value: `${queue.node.volume}%`, inline: true },
      { name: "Loop Mode", value: LOOP_LABELS[queue.repeatMode] || "Off", inline: true },
      { name: "Status", value: queue.node.isPaused() ? "Paused" : "Playing", inline: true }
    )
    .setImage(config.assets.bannerImage)
    .setFooter({ text: `${config.name} • Premium Sound Experience`, iconURL: config.assets.footerIcon })
    .setTimestamp();

  return embed;
}

/**
 * Builds the two rows of interactive control buttons for the panel.
 */
function buildControlRows(queue) {
  const isPaused = queue?.node?.isPaused();

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("music_previous").setEmoji(parseEmoji(emoji("previous"))).setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("music_pauseresume")
      .setEmoji(parseEmoji(isPaused ? emoji("play") : emoji("pause")))
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("music_skip").setEmoji(parseEmoji(emoji("skip"))).setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("music_stop").setEmoji(parseEmoji(emoji("stop"))).setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("music_shuffle").setEmoji(parseEmoji(emoji("shuffle"))).setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("music_loop").setEmoji(parseEmoji(emoji("loop"))).setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("music_queue").setEmoji(parseEmoji(emoji("queue"))).setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("music_volup").setEmoji(parseEmoji(emoji("volumeUp"))).setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("music_voldown").setEmoji(parseEmoji(emoji("volumeDown"))).setStyle(ButtonStyle.Danger)
  );

  return [row1, row2];
}

/**
 * Discord.js ButtonBuilder#setEmoji accepts either a unicode string or an
 * object { id, name, animated }. This helper parses a config emoji string
 * (either raw unicode fallback or a <a:name:id> mention) into the right shape.
 */
function parseEmoji(raw) {
  const match = /^<(a)?:(\w+):(\d+)>$/.exec(raw);
  if (!match) return raw; // plain unicode emoji
  const [, animated, name, id] = match;
  return { id, name, animated: Boolean(animated) };
}

/**
 * Creates or refreshes the persistent panel message in the queue's bound
 * text channel. Called on every track start / control button interaction.
 */
async function sendOrUpdatePanel(queue, track, GuildModel) {
  if (!queue?.metadata?.textChannel) return;
  const channel = queue.metadata.textChannel;

  const embed = buildNowPlayingEmbed(queue, track);
  const components = buildControlRows(queue);

  try {
    if (queue.metadata.panelMessage) {
      await queue.metadata.panelMessage.edit({ embeds: [embed], components });
      return queue.metadata.panelMessage;
    }

    const message = await channel.send({ embeds: [embed], components });
    queue.metadata.panelMessage = message;

    if (GuildModel) {
      await GuildModel.findOneAndUpdate(
        { guildId: queue.guild.id },
        { "panel.channelId": channel.id, "panel.messageId": message.id },
        { upsert: true }
      );
    }

    return message;
  } catch (err) {
    // Panel channel may have been deleted or permissions revoked — fail silently,
    // playback should never be interrupted by a cosmetic panel error.
    return null;
  }
}

module.exports = { buildNowPlayingEmbed, buildControlRows, sendOrUpdatePanel, parseEmoji };
