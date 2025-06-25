import { z, buildResponse } from '@purinton/mcp-server';

// Tool: delete-sticker
// Deletes a sticker from a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Delete a sticker from a guild.',
    {
      guildId: z.string(),
      stickerId: z.string(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, stickerId, reason } = _args;
      const guild = await discord.helpers.getGuild(guildId);
      const sticker = guild.stickers.cache.get(stickerId);
      if (!sticker) throw new Error('Sticker not found');
      try {
        await sticker.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete sticker: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { stickerId });
      return buildResponse({ success: true, stickerId });
    }
  );
}
