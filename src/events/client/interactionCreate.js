const config = require("../../config/config");
const logger = require("../../utils/logger");
const { errorEmbed, warningEmbed } = require("../../utils/embeds");
const { checkCooldown } = require("../../utils/cooldowns");
const { hasPermissions } = require("../../utils/permissions");
const GuildModel = require("../../models/Guild");

module.exports = {
  name: "interactionCreate",
  async execute(client, interaction) {
    try {
      // ── Buttons (music panel controls) ──────────────────────────────
      if (interaction.isButton()) {
        const handler = client.buttons.get(interaction.customId);
        if (handler) await handler(interaction, client);
        return;
      }

      // ── Autocomplete ─────────────────────────────────────────────────
      if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (command?.autocomplete) {
          await command.autocomplete(interaction, client).catch(() => interaction.respond([]));
        }
        return;
      }

      // ── Slash Commands ───────────────────────────────────────────────
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        // Maintenance mode gate
        if (interaction.guildId) {
          const guildSettings = await GuildModel.findOne({ guildId: interaction.guildId }).catch(() => null);
          if (guildSettings?.maintenanceMode && !config.owners.includes(interaction.user.id)) {
            return interaction.reply({
              embeds: [warningEmbed("Nocturne is currently in maintenance mode. Please try again shortly.")],
              ephemeral: true,
            });
          }
          if (guildSettings?.blacklistedUsers?.includes(interaction.user.id)) {
            return interaction.reply({
              embeds: [errorEmbed("You are blacklisted from using this bot in this server.")],
              ephemeral: true,
            });
          }
        }

        // Owner-only gate
        if (command.ownerOnly && !config.owners.includes(interaction.user.id)) {
          return interaction.reply({
            embeds: [errorEmbed("This command is restricted to bot owners.")],
            ephemeral: true,
          });
        }

        // Permission gate
        if (command.permissions?.length && interaction.member) {
          if (!hasPermissions(interaction.member, command.permissions)) {
            return interaction.reply({
              embeds: [errorEmbed(`You need the following permission(s): \`${command.permissions.join(", ")}\``)],
              ephemeral: true,
            });
          }
        }

        // Cooldown gate
        const remaining = checkCooldown(command.name, interaction.user.id, command.cooldown ?? config.cooldowns.default);
        if (remaining > 0) {
          return interaction.reply({
            embeds: [warningEmbed(`Please wait **${remaining.toFixed(1)}s** before using \`/${command.name}\` again.`)],
            ephemeral: true,
          });
        }

        logger.command(`/${command.name} used by ${interaction.user.tag} in ${interaction.guild?.name || "DM"}`);

        await command.execute({ client, interaction, isSlash: true, args: [] });
      }
    } catch (error) {
      logger.error(`interactionCreate error: ${error.stack || error.message}`);
      const payload = { embeds: [errorEmbed("An unexpected error occurred while running this command.")], ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => {});
      } else if (interaction.isRepliable?.()) {
        await interaction.reply(payload).catch(() => {});
      }
    }
  },
};
