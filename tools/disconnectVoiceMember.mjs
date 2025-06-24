import { z } from 'zod';
import { getGuild, getMember, buildResponse } from '../toolHelpers.mjs';

// Tool: disconnect-voice-member
// Disconnects a member from a voice channel.
export default async function (server, toolName = 'discord-disconnect-voice-member') {
  server.tool(
    toolName,
    'Disconnect a member from a voice channel.',
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
        await member.voice.disconnect(reason);
      } catch (err) {
        throw new Error('Failed to disconnect member: ' + (err.message || err));
      }
      return buildResponse({ success: true, memberId });
    }
  );
}
