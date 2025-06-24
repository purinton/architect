import { z } from 'zod';
import { getGuild, getChannel, buildResponse } from '../toolHelpers.mjs';

// Tool: list-threads
// Lists all active threads in a channel.
export default async function (server, toolName = 'discord-list-threads') {
  server.tool(
    toolName,
    'List all active threads in a channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
    },
    async (args, extra) => {
      const { guildId, channelId } = args;
      const guild = getGuild(guildId);
      const channel = await getChannel(guild, channelId);
      if (typeof channel.threads?.fetchActive !== 'function') throw new Error('Channel cannot fetch threads.');
      let threads;
      try {
        threads = await channel.threads.fetchActive();
      } catch (err) {
        throw new Error('Failed to fetch threads: ' + (err.message || err));
      }
      const threadList = Array.from(threads.threads.values()).map(th => ({
        id: th.id,
        name: th.name,
        ownerId: th.ownerId,
        archived: th.archived,
        locked: th.locked,
        createdAt: th.createdAt,
        type: th.type,
      }));
      return buildResponse(threadList);
    }
  );
}
