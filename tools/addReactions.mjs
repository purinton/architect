import { z, buildResponse } from '@purinton/mcp-server';

// Tool: add-reactions
// Adds multiple reactions (emojis) to multiple specified messages in a channel.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Add multiple reactions (emojis) to multiple messages in a channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
      messageIds: z.array(z.string()),
      emojis: z.array(z.string()), // Unicode emoji or custom emoji string
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, channelId, messageIds, emojis } = _args;
      const guild = await discord.helpers.getGuild(guildId);
      const channel = await discord.helpers.getChannel(guild, channelId);
      const results = [];
      for (const messageId of messageIds) {
        let message;
        try {
          message = await discord.helpers.getMessage(channel, messageId);
        } catch (err) {
          results.push({ messageId, success: false, error: 'Failed to fetch message: ' + (err.message || err) });
          continue;
        }
        for (const emoji of emojis) {
          try {
            await message.react(emoji);
            results.push({ messageId, emoji, success: true });
          } catch (err) {
            results.push({ messageId, emoji, success: false, error: 'Failed to add reaction: ' + (err.message || err) });
          }
        }
      }
      log.debug(`${toolName} Response`, { results });
      return buildResponse({ results });
    }
  );
}
