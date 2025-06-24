import { z } from 'zod';
import { getGuild, buildResponse } from '../toolHelpers.mjs';

// Tool: unban-member
// Unbans a user from a guild.
export default async function (server, toolName = 'discord-unban-member') {
  server.tool(
    toolName,
    'Remove ban from a user.',
    {
      guildId: z.string(),
      userId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, userId, reason } = args;
      const guild = getGuild(guildId);
      try {
        await guild.bans.remove(userId, reason);
      } catch (err) {
        throw new Error('Failed to unban user: ' + (err.message || err));
      }
      return buildResponse({ success: true, userId });
    }
  );
}
