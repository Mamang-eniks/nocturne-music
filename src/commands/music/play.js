const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer, QueryType } = require("discord-player");
const { successEmbed, errorEmbed, infoEmbed } = require("../../utils/embeds");
const { validateVoiceState } = require("../../utils/permissions");
const { emoji } = require("../../utils/emojis");
const config = require("../../config/config");

module.exports = {
  name: "play",
  aliases: ["p"],
  category: "music",
  description: "Play a song or playlist from YouTube, Spotify, or SoundCloud.",
  cooldown: config.cooldowns.play,
  noPrefix: true,

  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song or playlist from YouTube, Spotify, or SoundCloud.")
    .addStringOption((opt) =>
      opt.setName("query").setDescription("Song name or URL").setRequired(true).setAutocomplete(true)
    ),

  async autocomplete(interaction, client) {
    const focused = interaction.options.getFocused();
    if (!focused) return interaction.respond([]);

    const player = useMainPlayer();
    const results = await player.search(focused, { requestedBy: interaction.user }).catch(() => null);
    if (!results?.tracks?.length) return interaction.respond([]);

    await interaction.respond(
      results.tracks.slice(0, 10).map((t) => ({
        name: `${t.title} — ${t.author}`.slice(0, 100),
        value: t.url.slice(0, 100),
      }))
    );
  },

  async execute({ client, interaction, message, isSlash, args }) {
    const member = isSlash ? interaction.member : message.member;
    const guild = isSlash ? interaction.guild : message.guild;
    const channel = isSlash ? interaction.channel : message.channel;
    const author = isSlash ? interaction.user : message.author;
    const query = isSlash ? interaction.options.getString("query") : args.join(" ");

    const reply = async (payload) => {
      if (isSlash) {
        return interaction.deferred || interaction.replied
          ? interaction.followUp(payload)
          : interaction.reply(payload);
      }
      return message.reply(payload);
    };

    if (!query) {
      return reply({ embeds: [errorEmbed("Please provide a song name or URL.")] });
    }

    const player = useMainPlayer();
    const voiceCheck = validateVoiceState(member, player);
    if (!voiceCheck.ok) {
      return reply({ embeds: [errorEmbed(voiceCheck.reason)] });
    }

    if (isSlash) await interaction.deferReply();

    try {
      const searchResult = await player.search(query, {
        requestedBy: author,
        searchEngine: QueryType.AUTO, // auto-detects YouTube, Spotify, SoundCloud links vs plain text search
      });

      if (!searchResult?.tracks?.length) {
        return reply({ embeds: [errorEmbed(`No results found for **${query}**.`)] });
      }

      const { track } = await player.play(member.voice.channel, searchResult, {
        nodeOptions: {
          metadata: {
            textChannel: channel,
            panelMessage: null,
          },
          selfDeaf: true,
          volume: config.music.defaultVolume,
          leaveOnEmptyCooldown: config.music.leaveOnEmptyDelayMs,
          leaveOnEndCooldown: config.music.leaveOnEndDelayMs,
          leaveOnEmpty: true,
          leaveOnEnd: true,
          leaveOnStop: false,
          maxSize: config.music.maxQueueSize,
        },
      });

      const isPlaylist = searchResult.playlist != null;

      const description = isPlaylist
        ? `${emoji("success")} Queued **${searchResult.tracks.length}** tracks from playlist **${searchResult.playlist.title}**.`
        : `${emoji("success")} Queued **${track.title}** by **${track.author}**.`;

      return reply({ embeds: [successEmbed(description, "Added to Queue")] });
    } catch (error) {
      return reply({ embeds: [errorEmbed(`Failed to play track: \`${error.message}\``)] });
    }
  },
};
