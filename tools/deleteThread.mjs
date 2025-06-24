import { z } from 'zod';
import { getGuild, getChannel, getThread, buildResponse } from '../toolHelpers.mjs';

// Tool: delete-thread
// Deletes a thread in a channel.
export default async function (server, toolName = 'discord-delete-thread') {
  server.tool(
    toolName,
    'Delete a thread in a channel.',
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
        await thread.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete thread: ' + (err.message || err));
      }
      return buildResponse({ success: true, threadId });
    }
  );
}
