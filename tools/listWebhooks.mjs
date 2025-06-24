import { z } from 'zod';
import { getGuild, getChannel, buildResponse } from '../toolHelpers.mjs';

// Tool: list-webhooks
// Lists all webhooks for a guild, or for a specified channel if channelId is provided.
export default async function (server, toolName = 'discord-list-webhooks') {
  server.tool(
    toolName,
    'List all webhooks for a guild, or for a specified channel.',
    {
      guildId: z.string(),
      channelId: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, channelId } = args;
      const guild = getGuild(guildId);
      let webhooks = [];
      try {
        if (channelId) {
          const channel = await getChannel(guild, channelId);
          if (typeof channel.fetchWebhooks !== 'function') throw new Error('Channel cannot fetch webhooks.');
          const fetched = await channel.fetchWebhooks();
          webhooks = Array.from(fetched.values());
        } else {
          const fetched = await guild.fetchWebhooks();
          webhooks = Array.from(fetched.values());
        }
      } catch (err) {
        throw new Error('Failed to fetch webhooks: ' + (err.message || err));
      }
      const webhookList = webhooks.map(wh => ({
        id: wh.id,
        name: wh.name,
        channelId: wh.channelId,
        url: wh.url,
        type: wh.type,
        createdAt: wh.createdAt,
        creator: wh.owner ? `${wh.owner.username}#${wh.owner.discriminator}` : undefined,
        avatar: wh.avatar,
      }));
      return buildResponse(webhookList);
    }
  );
}
