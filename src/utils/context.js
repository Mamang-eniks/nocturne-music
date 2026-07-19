/**
 * ─────────────────────────────────────────────
 *  Command Context — unifies slash, prefix, and no-prefix invocations
 * ─────────────────────────────────────────────
 * Every command's `execute(ctx)` receives one of these regardless of how
 * it was triggered, so command logic never needs to branch on the source.
 */

class CommandContext {
    /**
     * @param {object} opts
     * @param {import('discord.js').Client} opts.client
     * @param {import('discord.js').Message} [opts.message]
     * @param {import('discord.js').ChatInputCommandInteraction} [opts.interaction]
     * @param {string[]} [opts.args]
     */
    constructor({ client, message = null, interaction = null, args = [] }) {
        this.client = client;
        this.message = message;
        this.interaction = interaction;
        this.args = args;

        this.isSlash = Boolean(interaction);
        this.guild = message?.guild ?? interaction?.guild ?? null;
        this.channel = message?.channel ?? interaction?.channel ?? null;
        this.member = message?.member ?? interaction?.member ?? null;
        this.user = message?.author ?? interaction?.user ?? null;

        this._deferred = false;
        this._replied = false;
    }

    /** Retrieves a string option (slash) or falls back to positional args (prefix). */
    getOption(name, index = 0) {
        if (this.isSlash) {
            return this.interaction.options.getString(name) ?? undefined;
        }
        return this.args[index];
    }

    getIntegerOption(name, index = 0) {
        if (this.isSlash) {
            return this.interaction.options.getInteger(name) ?? undefined;
        }
        const raw = this.args[index];
        const parsed = parseInt(raw, 10);
        return Number.isNaN(parsed) ? undefined : parsed;
    }

    /** Full remaining text after the command name, useful for search queries. */
    getText() {
        if (this.isSlash) {
            return this.interaction.options.getString('query')
                ?? this.interaction.options.getString('song')
                ?? '';
        }
        return this.args.join(' ');
    }

    async deferReply(options = {}) {
        if (this.isSlash) {
            await this.interaction.deferReply(options);
            this._deferred = true;
        }
        // Prefix/no-prefix commands don't need an explicit defer step.
    }

    /**
     * Sends a reply, transparently handling slash defer/reply state and
     * plain message replies for prefix/no-prefix invocations.
     */
    async reply(payload) {
        if (this.isSlash) {
            if (this.interaction.deferred || this.interaction.replied) {
                return this.interaction.editReply(payload);
            }
            return this.interaction.reply(payload);
        }
        return this.message.reply({ ...payload, allowedMentions: { repliedUser: false } });
    }

    /** Sends a follow-up message without replacing the original reply. */
    async followUp(payload) {
        if (this.isSlash) {
            return this.interaction.followUp(payload);
        }
        return this.channel.send(payload);
    }
}

module.exports = CommandContext;
