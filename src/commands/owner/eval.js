const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const util = require('util');
const embeds = require('../../utils/embeds');
const config = require('../../config/config');
const logger = require('../../utils/logger');

module.exports = {
    name: 'eval',
    aliases: ['ev'],
    description: 'Execute arbitrary JavaScript. Owner only.',
    usage: '<code>',
    cooldown: 0,
    ownerOnly: true,
    noPrefix: false, // deliberately prefix/slash only — too dangerous for bare-word no-prefix triggering
    slash: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Execute arbitrary JavaScript. Owner only.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((opt) => opt.setName('code').setDescription('JavaScript to evaluate').setRequired(true)),

    async execute(ctx) {
        const code = ctx.getOption('code', 0) || ctx.args.join(' ');
        if (!code) return ctx.reply({ embeds: [embeds.error('Provide code to evaluate.')] });

        const client = ctx.client;
        const guild = ctx.guild;
        const message = ctx.message;
        const player = client.player;

        try {
            let output = eval(code); // eslint-disable-line no-eval
            if (output instanceof Promise) output = await output;

            const formatted = typeof output === 'string' ? output : util.inspect(output, { depth: 1 });
            const clean = formatted.replace(new RegExp(config.token, 'gi'), '[REDACTED]');
            const truncated = clean.length > 1900 ? `${clean.slice(0, 1900)}...` : clean;

            return ctx.reply({ embeds: [embeds.success(`\`\`\`js\n${truncated || 'undefined'}\n\`\`\``, 'Eval Result')] });
        } catch (err) {
            logger.error('EvalCommand', 'Evaluation threw an error.', err);
            const errText = String(err?.message || err).slice(0, 1900);
            return ctx.reply({ embeds: [embeds.error(`\`\`\`js\n${errText}\n\`\`\``, 'Eval Error')] });
        }
    }
};
