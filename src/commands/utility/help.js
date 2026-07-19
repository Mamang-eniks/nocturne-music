const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { baseEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");
const { emoji } = require("../../utils/emojis");
const config = require("../../config/config");

const CATEGORY_META = {
  music: { label: "Music", emoji: emoji("music") },
  utility: { label: "Utility", emoji: "🛠️" },
  owner: { label: "Owner", emoji: emoji("crown") },
  system: { label: "System", emoji: "⚙️" },
};

function buildOverviewEmbed(client) {
  const categories = {};
  for (const command of client.commands.values()) {
    if (command.ownerOnly) continue; // hide owner commands from public help
    if (!categories[command.category]) categories[command.category] = [];
    categories[command.category].push(command.name);
  }

  const embed = baseEmbed()
    .setTitle(`${emoji("music")} ${config.name} — Command Help`)
    .setDescription(
      `Prefix: \`${config.prefix}\` • Slash commands are fully supported.\nUse the menu below to browse by category.`
    );

  for (const [category, names] of Object.entries(categories)) {
    const meta = CATEGORY_META[category] || { label: category, emoji: "•" };
    embed.addFields({
      name: `${meta.emoji} ${meta.label}`,
      value: names.map((n) => `\`${n}\``).join(", "),
    });
  }

  return embed;
}

module.exports = {
  name: "help",
  aliases: ["h", "commands"],
  category: "utility",
  description: "View all available commands.",
  data: new SlashCommandBuilder().setName("help").setDescription("View all available commands."),

  async execute(ctx) {
    const { reply } = getContext(ctx);
    const client = ctx.client;

    return reply({ embeds: [buildOverviewEmbed(client)] });
  },
};
