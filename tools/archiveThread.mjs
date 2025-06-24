import { z } from 'zod';
import { getGuild, getChannel, getThread, buildResponse } from '../toolHelpers.mjs';

// Tool: archive-thread
// Archives a thread in a channel.
export default async function (server, toolName = 'discord-archive-thread') {
  server.tool(
    toolName,
    'Archive a thread in a channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
      threadId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, channelId, threadId, reason } = args;
      const guild = getGuild(guildId);
      const channel = await getChannel(guild, channelId);
      const thread = await getThread(channel, threadId);
      try {
        await thread.setArchived(true, reason);
      } catch (err) {
        throw new Error('Failed to archive thread: ' + (err.message || err));
      }
      return buildResponse({ success: true, threadId });
    }
  );
}
