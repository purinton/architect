import { z } from 'zod';
import { getGuild, buildResponse } from '../toolHelpers.mjs';

// Tool: update-sticker
// Updates a sticker in a guild.
export default async function (server, toolName = 'discord-update-sticker') {
  server.tool(
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
    async (args, extra) => {
      const { guildId, stickerId, ...updateFields } = args;
      const guild = getGuild(guildId);
      let sticker;
      try {
        sticker = await guild.stickers.fetch(stickerId);
        await sticker.edit(updateFields);
      } catch (err) {
        throw new Error('Failed to update sticker: ' + (err.message || err));
      }
      return buildResponse({ success: true, stickerId });
    }
  );
}
