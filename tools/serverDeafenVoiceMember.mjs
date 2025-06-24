import { z } from 'zod';
import { getGuild, getMember, buildResponse } from '../toolHelpers.mjs';

// Tool: server-deafen-voice-member
// Deafens or undeafens a member in a voice channel.
export default async function (server, toolName = 'discord-server-deafen-voice-member') {
  server.tool(
    toolName,
    'Deafen or undeafen a member in a voice channel.',
    {
      guildId: z.string(),
      memberId: z.string(),
      deaf: z.boolean(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, deaf, reason } = args;
      const guild = getGuild(guildId);
      const member = await getMember(guild, memberId);
      try {
        await member.voice.setDeaf(deaf, reason);
      } catch (err) {
        throw new Error('Failed to set deafen state: ' + (err.message || err));
      }
      return buildResponse({ success: true, memberId, deaf });
    }
  );
}
