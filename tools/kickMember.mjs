import { z } from 'zod';
import { getGuild, getMember, buildResponse } from '../toolHelpers.mjs';

// Tool: kick-member
// Kicks a member from a guild.
export default async function (server, toolName = 'discord-kick-member') {
  server.tool(
    toolName,
    'Kick a member from the guild.',
    {
      guildId: z.string(),
      memberId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, reason } = args;
      const guild = getGuild(guildId);
      const member = await getMember(guild, memberId);
      try {
        await member.kick(reason);
      } catch (err) {
        throw new Error('Failed to kick member: ' + (err.message || err));
      }
      return buildResponse({ success: true, memberId });
    }
  );
}
