import { z, buildResponse } from '@purinton/mcp-server';

// Tool: list-threads
// Lists all active threads in a channel.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'List all active threads in a channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, channelId } = _args;
      const guild = discord.helpers.getGuild(guildId);
      const channel = await discord.helpers.getChannel(guild, channelId);
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
      const response = { threads: threadList };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
