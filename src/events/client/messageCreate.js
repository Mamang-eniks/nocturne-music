const config = require("../../config/config");
const logger = require("../../utils/logger");
const { errorEmbed, warningEmbed } = require("../../utils/embeds");
const { checkCooldown } = require("../../utils/cooldowns");
const { hasPermissions, isOwner } = require("../../utils/permissions");
const GuildModel = require("../../models/Guild");

module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    try {
      if (message.author.bot || !message.guild) return;

      const guildSettings = await GuildModel.findOne({ guildId: message.guild.id }).catch(() => null);
      const prefix = guildSettings?.prefix || config.prefix;

      let commandName = null;
      let args = [];
      let usedNoPrefix = false;

      if (message.content.startsWith(prefix)) {
        // ── Standard prefix command ──────────────────────────────────
        args = message.content.slice(prefix.length).trim().split(/\s+/);
        commandName = args.shift()?.toLowerCase();
      } else if (isOwner(message.author.id)) {
        // ── No-prefix owner command ──────────────────────────────────
        // Only triggers if the first word matches a command flagged noPrefix:true,
        // preventing the bot from misfiring on every normal owner message.
        const potentialArgs = message.content.trim().split(/\s+/);
        const potentialName = potentialArgs[0]?.toLowerCase();
        const potentialCommand =
          client.commands.get(potentialName) || client.commands.get(client.aliases.get(potentialName));

        if (potentialCommand?.noPrefix) {
          commandName = potentialName;
          args = potentialArgs.slice(1);
          usedNoPrefix = true;
        }
      }

      if (!commandName) return;

      const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
      if (!command) return;

      // No-prefix commands must ALWAYS be owner-gated, regardless of the
      // command's own ownerOnly flag, as a defense-in-depth measure.
      if (usedNoPrefix && !isOwner(message.author.id)) return;

      if (guildSettings?.maintenanceMode && !isOwner(message.author.id)) {
        return message.reply({
          embeds: [warningEmbed("Nocturne is currently in maintenance mode. Please try again shortly.")],
        });
      }

      if (guildSettings?.blacklistedUsers?.includes(message.author.id)) return;

      if (command.ownerOnly && !isOwner(message.author.id)) {
        return message.reply({ embeds: [errorEmbed("This command is restricted to bot owners.")] });
      }

      if (command.permissions?.length && !hasPermissions(message.member, command.permissions)) {
        return message.reply({
          embeds: [errorEmbed(`You need the following permission(s): \`${command.permissions.join(", ")}\``)],
        });
      }

      const remaining = checkCooldown(command.name, message.author.id, command.cooldown ?? config.cooldowns.default);
      if (remaining > 0) {
        return message.reply({
          embeds: [warningEmbed(`Please wait **${remaining.toFixed(1)}s** before using \`${prefix}${command.name}\` again.`)],
        });
      }

      logger.command(
        `${usedNoPrefix ? "[no-prefix] " : ""}${prefix}${command.name} used by ${message.author.tag} in ${message.guild.name}`
      );

      await command.execute({ client, message, isSlash: false, args });
    } catch (error) {
      logger.error(`messageCreate error: ${error.stack || error.message}`);
      message.reply({ embeds: [errorEmbed("An unexpected error occurred while running this command.")] }).catch(() => {});
    }
  },
};
