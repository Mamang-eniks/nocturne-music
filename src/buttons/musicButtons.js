const { errorEmbed, infoEmbed } = require("../utils/embeds");
const { buildNowPlayingEmbed, buildControlRows } = require("../utils/panelManager");
const { emoji } = require("../utils/emojis");
const config = require("../config/config");

const LOOP_CYCLE = [0, 2, 1]; // Off → Queue → Track → Off (skips odd ordering complaints)

/**
 * Shared guard: ensures the presser is in the same voice channel as the bot.
 */
function inSameVoice(interaction, queue) {
  const memberVoice = interaction.member.voice.channel;
  if (!memberVoice) return false;
  if (queue.channel && memberVoice.id !== queue.channel.id) return false;
  return true;
}

async function execute(interaction, client) {
  const player = client.player;
  const queue = player.nodes.get(interaction.guild.id);

  if (!queue || !queue.node.isPlaying()) {
    return interaction.reply({
      embeds: [errorEmbed("There's nothing playing right now.")],
      ephemeral: true,
    });
  }

  if (!inSameVoice(interaction, queue)) {
    return interaction.reply({
      embeds: [errorEmbed(`Join <#${queue.channel.id}> to control playback.`)],
      ephemeral: true,
    });
  }

  const id = interaction.customId;

  try {
    switch (id) {
      case "music_previous": {
        if (!queue.history.tracks.size) {
          return interaction.reply({ embeds: [errorEmbed("There's no previous track.")], ephemeral: true });
        }
        await queue.history.back();
        await interaction.deferUpdate();
        break;
      }

      case "music_pauseresume": {
        if (queue.node.isPaused()) {
          queue.node.resume();
        } else {
          queue.node.pause();
        }
        await interaction.deferUpdate();
        break;
      }

      case "music_skip": {
        const current = queue.currentTrack;
        queue.node.skip();
        await interaction.reply({
          embeds: [infoEmbed(`${emoji("skip")} Skipped **${current?.title || "the track"}**.`)],
          ephemeral: true,
        });
        return;
      }

      case "music_stop": {
        queue.delete();
        return interaction.reply({
          embeds: [infoEmbed(`${emoji("stop")} Playback stopped and queue cleared.`)],
        });
      }

      case "music_shuffle": {
        queue.tracks.shuffle();
        await interaction.reply({
          embeds: [infoEmbed(`${emoji("shuffle")} Queue shuffled.`)],
          ephemeral: true,
        });
        return;
      }

      case "music_loop": {
        const currentIndex = LOOP_CYCLE.indexOf(queue.repeatMode);
        const nextMode = LOOP_CYCLE[(currentIndex + 1) % LOOP_CYCLE.length];
        queue.setRepeatMode(nextMode);
        const labels = { 0: "Off", 1: "Track", 2: "Queue" };
        await interaction.reply({
          embeds: [infoEmbed(`${emoji("loop")} Loop mode set to **${labels[nextMode]}**.`)],
          ephemeral: true,
        });
        break;
      }

      case "music_queue": {
        const upcoming = queue.tracks.toArray().slice(0, 10);
        const list = upcoming.length
          ? upcoming.map((t, i) => `**${i + 1}.** ${t.title} — \`${t.duration}\``).join("\n")
          : "The queue is empty.";
        return interaction.reply({
          embeds: [infoEmbed(list, `${emoji("queue")} Upcoming Tracks`)],
          ephemeral: true,
        });
      }

      case "music_volup": {
        const newVolume = Math.min(queue.node.volume + 10, 100);
        queue.node.setVolume(newVolume);
        await interaction.deferUpdate();
        break;
      }

      case "music_voldown": {
        const newVolume = Math.max(queue.node.volume - 10, 0);
        queue.node.setVolume(newVolume);
        await interaction.deferUpdate();
        break;
      }

      default:
        return interaction.reply({ embeds: [errorEmbed("Unknown control.")], ephemeral: true });
    }

    // Refresh the panel to reflect the new state (pause icon, volume, loop mode, etc.)
    if (queue.metadata?.panelMessage) {
      const embed = buildNowPlayingEmbed(queue, queue.currentTrack);
      const components = buildControlRows(queue);
      await queue.metadata.panelMessage.edit({ embeds: [embed], components }).catch(() => {});
    }
  } catch (error) {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ embeds: [errorEmbed(error.message)], ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [errorEmbed(error.message)], ephemeral: true }).catch(() => {});
    }
  }
}

module.exports = {
  customIds: [
    "music_previous",
    "music_pauseresume",
    "music_skip",
    "music_stop",
    "music_shuffle",
    "music_loop",
    "music_queue",
    "music_volup",
    "music_voldown",
  ],
  execute,
};
