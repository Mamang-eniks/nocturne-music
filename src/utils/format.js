const config = require("../config/config");

/**
 * Formats milliseconds into HH:MM:SS or MM:SS.
 */
function formatDuration(ms) {
  if (!ms || Number.isNaN(ms)) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");

  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Builds a premium-styled progress bar string using the loop/dot glyphs.
 * Example: ▬▬▬🔘▬▬▬▬▬▬▬▬  02:14 / 03:45
 */
function progressBar(currentMs, totalMs, length = config.music.progressBarLength) {
  if (!totalMs || totalMs <= 0) {
    return `\`${"▬".repeat(length)}\` 🔴 LIVE`;
  }

  const ratio = Math.min(Math.max(currentMs / totalMs, 0), 1);
  const position = Math.round(ratio * length);

  const bar =
    "▬".repeat(Math.max(position - 1, 0)) +
    "🔘" +
    "▬".repeat(Math.max(length - position, 0));

  return `\`${formatDuration(currentMs)}\` ${bar} \`${formatDuration(totalMs)}\``;
}

/**
 * Truncates long strings (titles, descriptions) with an ellipsis.
 */
function truncate(str, max = 60) {
  if (!str) return "";
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

module.exports = { formatDuration, progressBar, truncate };
