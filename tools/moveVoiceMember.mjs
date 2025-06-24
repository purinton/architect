import { z } from 'zod';
import { getGuild, getMember, getChannel, buildResponse } from '../toolHelpers.mjs';

// Tool: move-voice-member
// Moves a member from one voice channel to another.
export default async function (server, toolName = 'discord-move-voice-member') {
  server.tool(
    toolName,
    'Move a member between two voice channels.',
    {
      guildId: z.string(),
      memberId: z.string(),
      channelId: z.string(), // Target voice channel
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, channelId, reason } = args;
      const guild = getGuild(guildId);
      const member = await getMember(guild, memberId);
      const channel = await getChannel(guild, channelId);
      if (channel.type !== 2) throw new Error('Target channel is not a voice channel.');
      try {
        await member.voice.setChannel(channel, reason);
      } catch (err) {
        throw new Error('Failed to move member: ' + (err.message || err));
      }
      return buildResponse({ success: true, memberId, channelId });
    }
  );
}
