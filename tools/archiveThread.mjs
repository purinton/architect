import { z, buildResponse } from '@purinton/mcp-server';

// Tool: archive-thread
// Archives a thread in a channel.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Archive a thread in a channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
      threadId: z.string(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, channelId, threadId, reason } = _args;
      const guild = await discord.getGuild(guildId);
      const channel = await discord.getChannel(guild, channelId);
      const thread = await discord.getThread(channel, threadId);
      try {
        await thread.setArchived(true, reason);
      } catch (err) {
        throw new Error('Failed to archive thread: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { threadId });
      return buildResponse({ success: true, threadId });
    }
  );
}
