const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');

const CATEGORY_LABELS = {
    music: '🎵 Music',
    utility: '🛠️ Utility',
    owner: '👑 Owner',
    system: '⚙️ System'
};

module.exports = {
    name: 'help',
    aliases: ['h', 'commands'],
    description: 'List every available command, or view details for one.',
    usage: '[command]',
    cooldown: config.cooldowns.default,
    noPrefix: true,
    slash: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List every available command, or view details for one.')
        .addStringOption((opt) => opt.setName('command').setDescription('A specific command to view')),

    async execute(ctx) {
        const target = ctx.getOption('command', 0);
        const client = ctx.client;

        if (target) {
            const command = client.commands.get(target.toLowerCase()) || client.commands.get(client.aliases.get(target.toLowerCase()));
            if (!command) {
                return ctx.reply({ embeds: [embeds.error(`No command named **${target}** was found.`)] });
            }

            const embed = embeds
                .info('', `Command: /${command.name}`)
                .addFields(
                    { name: 'Description', value: command.description || 'No description provided.' },
                    { name: 'Category', value: command.category, inline: true },
                    { name: 'Aliases', value: command.aliases?.length ? command.aliases.join(', ') : 'None', inline: true },
                    { name: 'Usage', value: `\`${config.prefix}${command.name} ${command.usage || ''}\``.trim() }
                );
            return ctx.reply({ embeds: [embed] });
        }

        const categories = {};
        for (const command of client.commands.values()) {
            if (!categories[command.category]) categories[command.category] = [];
            categories[command.category].push(command.name);
        }

        const embed = embeds.info('', `${config.emojis.music} Nocturne — Command List`).setDescription(
            'Use `/help <command>` for details on a specific command.\n\u200b'
        );

        for (const [category, names] of Object.entries(categories)) {
            embed.addFields({
                name: CATEGORY_LABELS[category] || category,
                value: names.map((n) => `\`${n}\``).join(' ')
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_category_select')
                .setPlaceholder('Browse by category')
                .addOptions(
                    Object.keys(categories).map((cat) => ({
                        label: CATEGORY_LABELS[cat] || cat,
                        value: cat
                    }))
                )
        );

        return ctx.reply({ embeds: [embed], components: [row] });
    }
};
