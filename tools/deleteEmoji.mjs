import { z } from 'zod';
import { getGuild, buildResponse } from '../toolHelpers.mjs';

// Tool: delete-emoji
// Deletes a custom emoji from a guild.
export default async function (server, toolName = 'discord-delete-emoji') {
  server.tool(
    toolName,
    'Remove a custom emoji from the guild.',
    {
      guildId: z.string(),
      emojiId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, emojiId, reason } = args;
      const guild = getGuild(guildId);
      const emoji = guild.emojis.cache.get(emojiId);
      if (!emoji) throw new Error('Emoji not found. Please re-run with a valid Emoji ID.');
      try {
        await emoji.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete emoji: ' + (err.message || err));
      }
      return buildResponse({ success: true, emojiId });
    }
  );
}
