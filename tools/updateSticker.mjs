import { z, buildResponse } from '@purinton/mcp-server';

// Tool: update-sticker
// Updates a sticker in a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Update a sticker in a guild.',
    {
      guildId: z.string(),
      stickerId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      tags: z.string().optional(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, stickerId, ...updateFields } = _args;
      let sticker;
      try {
        sticker = await discord.helpers.guilds.cache.get(guildId).stickers.fetch(stickerId);
        await sticker.edit(updateFields);
      } catch (err) {
        throw new Error('Failed to update sticker: ' + (err.message || err));
      }
      const response = { success: true, stickerId };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
