import { z } from 'zod';
import { getGuild, getMember, buildResponse } from '../toolHelpers.mjs';

// Tool: server-mute-voice-member
// Mutes or unmutes a member in a voice channel.
export default async function (server, toolName = 'discord-server-mute-voice-member') {
  server.tool(
    toolName,
    'Mute or unmute a member in a voice channel.',
    {
      guildId: z.string(),
      memberId: z.string(),
      mute: z.boolean(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, mute, reason } = args;
      const guild = getGuild(guildId);
      const member = await getMember(guild, memberId);
      try {
        await member.voice.setMute(mute, reason);
      } catch (err) {
        throw new Error('Failed to set mute state: ' + (err.message || err));
      }
      return buildResponse({ success: true, memberId, mute });
    }
  );
}
