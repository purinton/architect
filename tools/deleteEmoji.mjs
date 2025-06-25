import { z, buildResponse } from '@purinton/mcp-server';

// Tool: delete-emoji
// Deletes a custom emoji from a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Remove a custom emoji from the guild.',
    {
      guildId: z.string(),
      emojiId: z.string(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, emojiId, reason } = _args;
      const guild = await discord.helpers.getGuild(guildId);
      const emoji = guild.emojis.cache.get(emojiId);
      if (!emoji) throw new Error('Emoji not found');
      try {
        await emoji.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete emoji: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { emojiId });
      return buildResponse({ success: true, emojiId });
    }
  );
}
