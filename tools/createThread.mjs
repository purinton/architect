import { z, buildResponse } from '@purinton/mcp-server';

// Tool: create-thread
// Creates a thread in a channel.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create a thread in a channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
      name: z.string(),
      autoArchiveDuration: z.number().optional(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, channelId, name, autoArchiveDuration, reason } = _args;
      const guild = await discord.helpers.getGuild(discord, guildId);
      const channel = await discord.helpers.getChannel(guild, channelId);
      if (typeof channel.threads?.create !== 'function') throw new Error('Channel cannot create threads.');
      let thread;
      try {
        thread = await channel.threads.create({ name, autoArchiveDuration, reason });
      } catch (err) {
        throw new Error('Failed to create thread: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { threadId: thread.id });
      return buildResponse({ success: true, threadId: thread.id });
    }
  );
}
