const { successEmbed, errorEmbed } = require("../../utils/embeds");
const { getContext } = require("../../utils/context");
const config = require("../../config/config");
const util = require("util");

/**
 * !eval — owner-only. Executes arbitrary JS in the bot's process for live
 * debugging. Gated by ownerOnly:true AND a hardcoded owner check inside
 * execute() as defense-in-depth (never rely on a single gate for something
 * this powerful).
 */
module.exports = {
  name: "eval",
  category: "owner",
  description: "Execute JavaScript code (owner only).",
  ownerOnly: true,
  noPrefix: true,

  async execute(ctx) {
    const { reply, author } = getContext(ctx);

    if (!config.owners.includes(author.id)) {
      return reply({ embeds: [errorEmbed("This command is restricted to bot owners.")] });
    }

    const code = ctx.isSlash ? null : ctx.args.join(" ");
    if (!code) {
      return reply({ embeds: [errorEmbed("Provide code to evaluate, e.g. `!eval 1 + 1`.")] });
    }

    try {
      // eslint-disable-next-line no-eval
      let output = eval(code);
      if (output instanceof Promise) output = await output;

      const inspected = typeof output === "string" ? output : util.inspect(output, { depth: 1 });
      const clean = inspected.replace(new RegExp(config.token, "g"), "[REDACTED]");

      return reply({
        embeds: [successEmbed(`\`\`\`js\n${clean.slice(0, 3900)}\n\`\`\``, "Eval Output")],
      });
    } catch (error) {
      return reply({ embeds: [errorEmbed(`\`\`\`js\n${String(error).slice(0, 3900)}\n\`\`\``, "Eval Error")] });
    }
  },
};
