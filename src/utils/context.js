/**
 * Normalizes the unified command context object ({ client, interaction, message, isSlash, args })
 * into a consistent shape regardless of whether the command was triggered via
 * slash command, prefix command, or no-prefix owner command.
 */
function getContext(ctx) {
  const { interaction, message, isSlash } = ctx;
  const source = isSlash ? interaction : message;

  return {
    member: source.member,
    guild: source.guild,
    channel: isSlash ? interaction.channel : message.channel,
    author: isSlash ? interaction.user : message.author,
    reply: async (payload) => {
      if (isSlash) {
        return interaction.deferred || interaction.replied
          ? interaction.followUp(payload)
          : interaction.reply(payload);
      }
      return message.reply(payload);
    },
  };
}

module.exports = { getContext };
