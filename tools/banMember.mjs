import { z } from 'zod';
import { getGuild, getMember, buildResponse } from '../toolHelpers.mjs';

// Tool: ban-member
// Bans a member from a guild.
export default async function (server, toolName = 'discord-ban-member') {
  server.tool(
    toolName,
    'Ban a member with optional reason and duration.',
    {
      guildId: z.string(),
      memberId: z.string(),
      reason: z.string().optional(),
      deleteMessageSeconds: z.number().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, reason, deleteMessageSeconds } = args;
      const guild = getGuild(guildId);
      const member = await getMember(guild, memberId);
      try {
        await member.ban({ reason, deleteMessageSeconds });
      } catch (err) {
        throw new Error('Failed to ban member: ' + (err.message || err));
      }
      return buildResponse({ success: true, memberId });
    }
  );
}
