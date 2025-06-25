import { z, buildResponse } from '@purinton/mcp-server';

// Tool: delete-thread
// Deletes a thread in a channel.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Delete a thread in a channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
      threadId: z.string(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, channelId, threadId, reason } = _args;
      const guild = await discord.helpers.getGuild(guildId);
      const channel = await discord.helpers.getChannel(guild, channelId);
      const thread = await discord.helpers.getThread(channel, threadId);
      try {
        await thread.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete thread: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { threadId });
      return buildResponse({ success: true, threadId });
    }
  );
}
