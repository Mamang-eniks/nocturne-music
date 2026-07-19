/**
 * Lightweight structured logger.
 * Keeps Railway logs readable without pulling in a heavy dependency.
 */

const COLORS = {
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

function timestamp() {
  return new Date().toISOString().replace("T", " ").split(".")[0];
}

function base(level, color, message) {
  console.log(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${color}${level}${COLORS.reset} ${message}`);
}

module.exports = {
  info: (msg) => base("INFO ", COLORS.cyan, msg),
  success: (msg) => base("READY", COLORS.green, msg),
  warn: (msg) => base("WARN ", COLORS.yellow, msg),
  error: (msg) => base("ERROR", COLORS.red, msg),
  music: (msg) => base("MUSIC", COLORS.magenta, msg),
  command: (msg) => base("CMD  ", COLORS.cyan, msg),
};
