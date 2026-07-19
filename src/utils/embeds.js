const { EmbedBuilder } = require("discord.js");
const config = require("../config/config");
const { emoji } = require("./emojis");

/**
 * All embeds across the bot are built through this factory so the
 * dark-purple/premium theme stays perfectly consistent everywhere.
 */

function baseEmbed() {
  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setFooter({ text: `${config.name} • Premium Sound Experience`, iconURL: config.assets.footerIcon })
    .setTimestamp();
}

function successEmbed(description, title = "Success") {
  return baseEmbed()
    .setColor(config.colors.success)
    .setTitle(`${emoji("success")} ${title}`)
    .setDescription(description);
}

function errorEmbed(description, title = "Something went wrong") {
  return baseEmbed()
    .setColor(config.colors.danger)
    .setTitle(`${emoji("error")} ${title}`)
    .setDescription(description);
}

function warningEmbed(description, title = "Hold on") {
  return baseEmbed()
    .setColor(config.colors.warning)
    .setTitle(`${emoji("warning")} ${title}`)
    .setDescription(description);
}

function infoEmbed(description, title = config.name) {
  return baseEmbed()
    .setTitle(`${emoji("music")} ${title}`)
    .setDescription(description);
}

module.exports = { baseEmbed, successEmbed, errorEmbed, warningEmbed, infoEmbed };
