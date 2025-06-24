import { z } from 'zod';
import { getGuild, getChannel, buildResponse } from '../toolHelpers.mjs';

// Tool: create-thread
// Creates a thread in a channel.
export default async function (server, toolName = 'discord-create-thread') {
  server.tool(
    toolName,
    'Create a thread in a channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
      name: z.string(),
      autoArchiveDuration: z.number().optional(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, channelId, name, autoArchiveDuration, reason } = args;
      const guild = getGuild(guildId);
      const channel = await getChannel(guild, channelId);
      if (typeof channel.threads?.create !== 'function') throw new Error('Channel cannot create threads.');
      let thread;
      try {
        thread = await channel.threads.create({ name, autoArchiveDuration, reason });
      } catch (err) {
        throw new Error('Failed to create thread: ' + (err.message || err));
      }
      return buildResponse({ success: true, threadId: thread.id });
    }
  );
}
