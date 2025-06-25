import { z, buildResponse } from '@purinton/mcp-server';

// Tool: list-webhooks
// Lists all webhooks for a guild, or for a specified channel if channelId is provided.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'List all webhooks for a guild, or for a specified channel.',
    {
      guildId: z.string(),
      channelId: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, channelId } = _args;
      let webhooks = [];
      try {
        if (channelId) {
          const channel = await discord.helpers.getChannel(channelId);
          if (typeof channel.fetchWebhooks !== 'function') throw new Error('Channel cannot fetch webhooks.');
          const fetched = await channel.fetchWebhooks();
          webhooks = Array.from(fetched.values());
        } else {
          const guild = await discord.helpers.getGuild(discord, guildId);
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
      const response = { webhooks: webhookList };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
