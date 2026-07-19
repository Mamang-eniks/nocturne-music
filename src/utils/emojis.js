const config = require("../config/config");

/**
 * Central emoji resolver.
 * Allows swapping emoji IDs in config.js only, with zero code changes
 * anywhere else in the project. Falls back to a safe Unicode glyph if a
 * custom emoji ID hasn't been configured yet (still shows a placeholder
 * rather than throwing or rendering "undefined").
 */

const FALLBACKS = {
  play: "▶️",
  pause: "⏸️",
  stop: "⏹️",
  skip: "⏭️",
  previous: "⏮️",
  queue: "📜",
  volume: "🔊",
  volumeUp: "🔊",
  volumeDown: "🔉",
  loop: "🔁",
  loopTrack: "🔂",
  shuffle: "🔀",
  music: "🎵",
  loading: "⏳",
  success: "✅",
  error: "❌",
  warning: "⚠️",
  arrowRight: "➡️",
  disc: "💿",
  mic: "🎙️",
  crown: "👑",
};

function emoji(name) {
  const value = config.emojis[name];
  if (!value || value.includes("EMOJI_ID") || /:1{15,}[0-9]*>/.test(value)) {
    return FALLBACKS[name] || "";
  }
  return value;
}

module.exports = { emoji };
