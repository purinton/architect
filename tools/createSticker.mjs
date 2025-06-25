import { z, buildResponse } from '@purinton/mcp-server';

// Tool: create-sticker
// Creates a sticker in a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create a sticker in a guild.',
    {
      guildId: z.string(),
      name: z.string(),
      description: z.string(),
      tags: z.string(),
      file: z.string(), // URL or base64
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, ...stickerData } = _args;
      const guild = await discord.helpers.getGuild(guildId);
      let sticker;
      try {
        sticker = await guild.stickers.create(discord.helpers.cleanOptions(stickerData));
      } catch (err) {
        throw new Error('Failed to create sticker: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { stickerId: sticker.id });
      return buildResponse({ success: true, stickerId: sticker.id });
    }
  );
}
