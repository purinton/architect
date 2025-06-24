import { z } from 'zod';
import { getGuild, getChannel, buildResponse } from '../toolHelpers.mjs';

// Tool: delete-channel
// Deletes a channel from a guild.
export default async function (server, toolName = 'discord-delete-channel') {
  server.tool(
    toolName,
    'Remove a specified channel from a guild.',
    {
      guildId: z.string(),
      channelId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, channelId, reason } = args;
      const guild = getGuild(guildId);
      const channel = await getChannel(guild, channelId);
      try {
        await channel.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete channel: ' + (err.message || err));
      }
      return buildResponse({ success: true, deletedChannelId: channelId });
    }
  );
}
