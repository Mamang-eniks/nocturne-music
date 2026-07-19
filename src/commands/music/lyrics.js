const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { baseEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");
const { truncate } = require("../../utils/format");
const config = require("../../config/config");

/**
 * Uses the Genius API to search for a song, then scrapes the lyrics page.
 * Requires GENIUS_API_KEY to be set — command gracefully explains if missing.
 */
async function fetchLyrics(query) {
  if (!config.genius.apiKey) {
    throw new Error("Lyrics are unavailable — GENIUS_API_KEY is not configured.");
  }

  const searchRes = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${config.genius.apiKey}` },
  });
  const searchData = await searchRes.json();
  const hit = searchData?.response?.hits?.[0]?.result;

  if (!hit) return null;

  const pageRes = await fetch(hit.url);
  const html = await pageRes.text();

  // Extract lyrics from Genius's embedded <div data-lyrics-container="true">
  const matches = [...html.matchAll(/<div data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/g)];
  if (!matches.length) return null;

  const rawText = matches
    .map((m) => m[1])
    .join("\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .trim();

  return { title: hit.full_title, url: hit.url, thumbnail: hit.song_art_image_thumbnail_url, lyrics: rawText };
}

module.exports = {
  name: "lyrics",
  category: "music",
  description: "Fetch lyrics for the currently playing track or a specific song.",
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Fetch lyrics for the currently playing track or a specific song.")
    .addStringOption((opt) => opt.setName("query").setDescription("Song name (optional — defaults to current track)")),

  async execute(ctx) {
    const { guild, reply, isSlash, args } = getContext(ctx);
    const player = useMainPlayer();
    const queue = player.nodes.get(guild.id);

    const query = isSlash
      ? ctx.interaction.options.getString("query")
      : args.join(" ");

    const searchTerm = query || (queue?.currentTrack ? `${queue.currentTrack.title} ${queue.currentTrack.author}` : null);

    if (!searchTerm) {
      return reply({ embeds: [errorEmbed("Provide a song name or play something first.")] });
    }

    try {
      const result = await fetchLyrics(searchTerm);
      if (!result) {
        return reply({ embeds: [errorEmbed(`No lyrics found for **${searchTerm}**.`)] });
      }

      const embed = baseEmbed()
        .setTitle(result.title)
        .setURL(result.url)
        .setThumbnail(result.thumbnail || null)
        .setDescription(truncate(result.lyrics, 4000));

      return reply({ embeds: [embed] });
    } catch (error) {
      return reply({ embeds: [errorEmbed(error.message)] });
    }
  },
};
