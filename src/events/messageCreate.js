const embeds = require('../utils/embeds');
const config = require('../config/config');
const logger = require('../utils/logger');
const cooldownManager = require('../utils/cooldownManager');
const antiSpam = require('../utils/antiSpam');
const { isOwner } = require('../utils/permissions');
const Blacklist = require('../models/Blacklist');
const GuildSettings = require('../models/GuildSettings');
const CommandContext = require('../utils/context');

module.exports = {
    name: 'messageCreate',

    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        const settings = await GuildSettings.findOne({ guildId: message.guild.id }).catch(() => null);
        const prefix = settings?.prefix || config.prefix;

        let commandName;
        let args;
        let usedNoPrefix = false;

        if (message.content.startsWith(prefix)) {
            args = message.content.slice(prefix.length).trim().split(/\s+/);
            commandName = args.shift()?.toLowerCase();
        } else if (isOwner(message.author.id)) {
            // No-prefix commands: only ever considered for configured bot owners,
            // and only when the message's first word exactly matches a command
            // (or alias) that has explicitly opted in via `noPrefix: true`.
            const [first, ...rest] = message.content.trim().split(/\s+/);
            const candidate = first?.toLowerCase();
            const resolved = client.commands.get(candidate) || client.commands.get(client.aliases.get(candidate));

            if (resolved?.noPrefix) {
                commandName = candidate;
                args = rest;
                usedNoPrefix = true;
            }
        }

        if (!commandName) return;

        const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
        if (!command) return;

        if (usedNoPrefix && !isOwner(message.author.id)) return; // defense in depth

        // ── Blacklist check ────────────────────────────────
        const blocked = await Blacklist.findOne({
            targetId: { $in: [message.author.id, message.guild.id] }
        }).catch(() => null);

        if (blocked && !isOwner(message.author.id)) {
            return message.reply({ embeds: [embeds.error('You (or this server) have been blacklisted from using Nocturne.')] });
        }

        // ── Owner-only guard ───────────────────────────────
        if (command.ownerOnly && !isOwner(message.author.id)) {
            return message.reply({ embeds: [embeds.error('This command is restricted to bot owners.')] });
        }

        // ── Maintenance mode ───────────────────────────────
        if (settings?.maintenance && !isOwner(message.author.id)) {
            return message.reply({ embeds: [embeds.warning('Nocturne is in maintenance mode on this server.')] });
        }

        // ── Optional music-channel lock ────────────────────
        const musicChannelId = settings?.musicChannelId || config.musicChannelId;
        if (musicChannelId && command.category === 'music' && message.channel.id !== musicChannelId) {
            return message
                .reply({ embeds: [embeds.warning(`Music commands are restricted to <#${musicChannelId}>.`)] })
                .then((m) => setTimeout(() => m.delete().catch(() => null), 5000));
        }

        // ── Anti-spam ───────────────────────────────────────
        if (antiSpam.hit(message.author.id) && !isOwner(message.author.id)) {
            return message.reply({ embeds: [embeds.warning('You are sending commands too quickly — slow down a little.')] });
        }

        // ── Cooldown ────────────────────────────────────────
        const cooldownMs = command.cooldown ?? config.cooldowns.default;
        const remaining = cooldownManager.check(message.author.id, command.name);
        if (remaining > 0 && !isOwner(message.author.id)) {
            return message.reply({
                embeds: [embeds.warning(`Please wait **${(remaining / 1000).toFixed(1)}s** before using \`${command.name}\` again.`)]
            });
        }
        cooldownManager.trigger(message.author.id, command.name, cooldownMs);

        // ── Execute ─────────────────────────────────────────
        try {
            const ctx = new CommandContext({ client, message, args });
            await command.execute(ctx);
            logger.info(
                usedNoPrefix ? 'NoPrefixCommand' : 'PrefixCommand',
                `${command.name} used by ${message.author.tag} in ${message.guild.name}`
            );
        } catch (err) {
            logger.error('PrefixCommand', `Error executing ${command.name}`, err);
            await message.reply({ embeds: [embeds.error('An unexpected error occurred while running that command.')] }).catch(() => null);
        }
    }
};
