const config = require("../config/config");

/**
 * Simple in-memory cooldown tracker: Map<commandName, Map<userId, expiresAt>>
 * Good enough for single-instance deployments (Railway free/hobby tier).
 * For multi-instance scaling, swap this for a Redis-backed store.
 */
const cooldowns = new Map();

/**
 * Checks whether a user is on cooldown for a given command.
 * Returns 0 if not on cooldown, otherwise the remaining seconds.
 */
function checkCooldown(commandName, userId, seconds = config.cooldowns.default) {
  if (!cooldowns.has(commandName)) cooldowns.set(commandName, new Map());
  const timestamps = cooldowns.get(commandName);
  const now = Date.now();
  const cooldownMs = seconds * 1000;

  if (timestamps.has(userId)) {
    const expiresAt = timestamps.get(userId) + cooldownMs;
    if (now < expiresAt) {
      return (expiresAt - now) / 1000;
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownMs);
  return 0;
}

module.exports = { checkCooldown };
