import { z } from 'zod';
import { getGuild, getMember, buildResponse } from '../toolHelpers.mjs';

// Tool: update-member-nickname
// Updates a member's nickname in a guild, with improved error handling and returns updated info.
export default async function (server, toolName = 'discord-update-member-nickname') {
  server.tool(
    toolName,
    "Change a member's nickname in a guild. Returns updated member info.",
    {
      guildId: z.string(),
      memberId: z.string(),
      nickname: z.string().nullable(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, nickname, reason } = args;
      const guild = getGuild(guildId);
      const member = await getMember(guild, memberId);
      try {
        await member.setNickname(nickname, reason);
      } catch (err) {
        throw new Error('Failed to update nickname: ' + (err.message || err));
      }
      return buildResponse({ success: true, memberId, nickname: member.nickname, displayName: member.displayName });
    }
  );
}
