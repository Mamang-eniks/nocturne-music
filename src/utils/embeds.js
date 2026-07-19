/**
 * ─────────────────────────────────────────────
 *  Embed Factory — consistent, premium-themed embeds
 * ─────────────────────────────────────────────
 * Centralizing embed construction means every command shares the same
 * dark-purple identity instead of hand-rolling colors/footers everywhere.
 */

const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

const FOOTER_TEXT = 'Nocturne';

function baseEmbed() {
    return new EmbedBuilder()
        .setColor(config.colors.primary)
        .setFooter({ text: FOOTER_TEXT })
        .setTimestamp();
}

module.exports = {
    /** Neutral informational embed. */
    info(description, title = null) {
        const embed = baseEmbed().setDescription(`${config.emojis.music} ${description}`);
        if (title) embed.setTitle(title);
        return embed;
    },

    /** Success (green) embed. */
    success(description, title = null) {
        const embed = baseEmbed()
            .setColor(config.colors.success)
            .setDescription(`${config.emojis.success} ${description}`);
        if (title) embed.setTitle(title);
        return embed;
    },

    /** Error (red) embed. */
    error(description, title = 'Something went wrong') {
        return baseEmbed()
            .setColor(config.colors.danger)
            .setTitle(title)
            .setDescription(`${config.emojis.error} ${description}`);
    },

    /** Warning (yellow) embed. */
    warning(description, title = null) {
        const embed = baseEmbed()
            .setColor(config.colors.warning)
            .setDescription(`${config.emojis.error} ${description}`);
        if (title) embed.setTitle(title);
        return embed;
    },

    baseEmbed
};
