import { z } from 'zod';
import { getGuild, getMember, buildResponse } from '../toolHelpers.mjs';

// Tool: timeout-member
// Timeouts (mutes) a member in a guild for a specified duration.
export default async function (server, toolName = 'discord-timeout-member') {
  server.tool(
    toolName,
    'Timeout (mute) a member for a specified duration and optional reason.',
    {
      guildId: z.string(),
      memberId: z.string(),
      durationMs: z.number(), // Duration in milliseconds
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, durationMs, reason } = args;
      const guild = getGuild(guildId);
      const member = await getMember(guild, memberId);
      try {
        await member.timeout(durationMs, reason);
      } catch (err) {
        throw new Error('Failed to timeout member: ' + (err.message || err));
      }
      return buildResponse({ success: true, memberId, durationMs });
    }
  );
}
