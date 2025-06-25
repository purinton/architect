import { z, buildResponse } from '@purinton/mcp-server';

// Tool: delete-channel
// Deletes a channel from a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Remove a specified channel from a guild.',
    {
      guildId: z.string(),
      channelId: z.string(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, channelId, reason } = _args;
      const guild = await discord.helpers.getGuild(guildId);
      const channel = await discord.helpers.getChannel(guild, channelId);
      try {
        await channel.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete channel: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { channelId });
      return buildResponse({ success: true, channelId });
    }
  );
}
