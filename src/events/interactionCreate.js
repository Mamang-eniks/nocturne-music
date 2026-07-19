const embeds = require('../utils/embeds');
const config = require('../config/config');
const logger = require('../utils/logger');
const cooldownManager = require('../utils/cooldownManager');
const antiSpam = require('../utils/antiSpam');
const { isOwner } = require('../utils/permissions');
const Blacklist = require('../models/Blacklist');
const GuildSettings = require('../models/GuildSettings');
const CommandContext = require('../utils/context');

const CATEGORY_LABELS = {
    music: '🎵 Music',
    utility: '🛠️ Utility',
    owner: '👑 Owner',
    system: '⚙️ System'
};

module.exports = {
    name: 'interactionCreate',

    async execute(interaction, client) {
        try {
            if (interaction.isAutocomplete()) return handleAutocomplete(interaction, client);
            if (interaction.isChatInputCommand()) return handleSlashCommand(interaction, client);
            if (interaction.isButton()) return handleButton(interaction, client);
            if (interaction.isStringSelectMenu()) return handleSelectMenu(interaction, client);
        } catch (err) {
            logger.error('InteractionCreate', 'Unhandled interaction error.', err);
        }
    }
};

async function handleAutocomplete(interaction, client) {
    const command = client.commands.get(interaction.commandName);
    if (!command?.autocomplete) return;

    try {
        await command.autocomplete(interaction);
    } catch (err) {
        logger.error('Autocomplete', `Autocomplete failed for /${interaction.commandName}`, err);
    }
}

async function handleSlashCommand(interaction, client) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // ── Blacklist check ────────────────────────────────
    if (interaction.guild) {
        const blocked = await Blacklist.findOne({
            targetId: { $in: [interaction.user.id, interaction.guild.id] }
        }).catch(() => null);

        if (blocked && !isOwner(interaction.user.id)) {
            return interaction.reply({
                embeds: [embeds.error('You (or this server) have been blacklisted from using Nocturne.')],
                ephemeral: true
            });
        }
    }

    // ── Owner-only guard ───────────────────────────────
    if (command.ownerOnly && !isOwner(interaction.user.id)) {
        return interaction.reply({ embeds: [embeds.error('This command is restricted to bot owners.')], ephemeral: true });
    }

    // ── Maintenance mode ───────────────────────────────
    if (interaction.guild) {
        const settings = await GuildSettings.findOne({ guildId: interaction.guild.id }).catch(() => null);
        if (settings?.maintenance && !isOwner(interaction.user.id)) {
            return interaction.reply({ embeds: [embeds.warning('Nocturne is in maintenance mode on this server.')], ephemeral: true });
        }
    }

    // ── Anti-spam ───────────────────────────────────────
    if (antiSpam.hit(interaction.user.id) && !isOwner(interaction.user.id)) {
        return interaction.reply({ embeds: [embeds.warning('You are sending commands too quickly — slow down a little.')], ephemeral: true });
    }

    // ── Cooldown ────────────────────────────────────────
    const cooldownMs = command.cooldown ?? config.cooldowns.default;
    const remaining = cooldownManager.check(interaction.user.id, command.name);
    if (remaining > 0 && !isOwner(interaction.user.id)) {
        return interaction.reply({
            embeds: [embeds.warning(`Please wait **${(remaining / 1000).toFixed(1)}s** before using \`/${command.name}\` again.`)],
            ephemeral: true
        });
    }
    cooldownManager.trigger(interaction.user.id, command.name, cooldownMs);

    // ── Execute ─────────────────────────────────────────
    try {
        const ctx = new CommandContext({ client, interaction });
        await command.execute(ctx);
        logger.info('SlashCommand', `/${command.name} used by ${interaction.user.tag} in ${interaction.guild?.name ?? 'DM'}`);
    } catch (err) {
        logger.error('SlashCommand', `Error executing /${command.name}`, err);
        const payload = { embeds: [embeds.error('An unexpected error occurred while running that command.')] };
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(payload).catch(() => null);
        } else {
            await interaction.reply({ ...payload, ephemeral: true }).catch(() => null);
        }
    }
}

async function handleButton(interaction, client) {
    const handler = client.buttons.get(interaction.customId);
    if (!handler) return;

    try {
        await handler.execute(interaction, client);
    } catch (err) {
        logger.error('ButtonInteraction', `Error handling button ${interaction.customId}`, err);
        await interaction
            .reply({ embeds: [embeds.error('Something went wrong handling that button.')], ephemeral: true })
            .catch(() => null);
    }
}

async function handleSelectMenu(interaction, client) {
    if (interaction.customId !== 'help_category_select') return;

    const category = interaction.values[0];
    const commands = [...client.commands.values()].filter((c) => c.category === category);

    const embed = embeds
        .info('', `${CATEGORY_LABELS[category] || category} Commands`)
        .setDescription(
            commands.map((c) => `\`${c.name}\` — ${c.description || 'No description.'}`).join('\n') || 'No commands in this category.'
        );

    await interaction.update({ embeds: [embed] }).catch(() => null);
}
