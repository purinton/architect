import { z } from 'zod';
import { getGuild, cleanOptions, buildResponse } from '../toolHelpers.mjs';

// Tool: create-sticker
// Creates a sticker in a guild.
export default async function (server, toolName = 'discord-create-sticker') {
  server.tool(
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
    async (args, extra) => {
      const { guildId, ...stickerData } = args;
      const guild = getGuild(guildId);
      let sticker;
      try {
        sticker = await guild.stickers.create(cleanOptions(stickerData));
      } catch (err) {
        throw new Error('Failed to create sticker: ' + (err.message || err));
      }
      return buildResponse({ success: true, stickerId: sticker.id });
    }
  );
}
