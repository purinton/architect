import { z } from 'zod';
import { getGuild, buildResponse } from '../toolHelpers.mjs';

// Tool: delete-sticker
// Deletes a sticker from a guild.
export default async function (server, toolName = 'discord-delete-sticker') {
  server.tool(
    toolName,
    'Delete a sticker from a guild.',
    {
      guildId: z.string(),
      stickerId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, stickerId, reason } = args;
      const guild = getGuild(guildId);
      let sticker;
      try {
        sticker = await guild.stickers.fetch(stickerId);
        await sticker.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete sticker: ' + (err.message || err));
      }
      return buildResponse({ success: true, stickerId });
    }
  );
}
