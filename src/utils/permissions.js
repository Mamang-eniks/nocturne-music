const config = require("../config/config");

function isOwner(userId) {
  return config.owners.includes(userId);
}

/**
 * Checks that the member has all the given Discord permission flags.
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').PermissionResolvable[]} permissions
 */
function hasPermissions(member, permissions = []) {
  if (!member) return false;
  if (isOwner(member.id)) return true;
  return member.permissions.has(permissions);
}

/**
 * Voice channel validation shared by every music command.
 * Returns { ok: true } or { ok: false, reason: string }.
 */
function validateVoiceState(member, player) {
  const memberVoice = member.voice;

  if (!memberVoice?.channel) {
    return { ok: false, reason: "You need to join a voice channel first." };
  }

  const queue = player.nodes.get(member.guild.id);
  if (queue && queue.channel && memberVoice.channel.id !== queue.channel.id) {
    return {
      ok: false,
      reason: `I'm already playing music in <#${queue.channel.id}>. Join that channel to control playback.`,
    };
  }

  const permissions = memberVoice.channel.permissionsFor(member.guild.members.me);
  if (!permissions.has(["Connect", "Speak"])) {
    return { ok: false, reason: "I don't have permission to join or speak in your voice channel." };
  }

  return { ok: true };
}

module.exports = { isOwner, hasPermissions, validateVoiceState };
