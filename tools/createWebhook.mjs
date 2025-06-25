import { z, buildResponse } from '@purinton/mcp-server';

// Tool: create-webhook
// Creates a webhook in a specified channel.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create a webhook in a specified channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
      name: z.string(),
      avatar: z.string().optional(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, channelId, name, avatar, reason } = _args;
      const guild = await discord.helpers.getGuild(discord, guildId);
      const channel = await discord.helpers.getChannel(guild, channelId);
      if (typeof channel.createWebhook !== 'function') throw new Error('Channel cannot create webhooks.');
      let webhook;
      try {
        webhook = await channel.createWebhook({ name, avatar, reason });
      } catch (err) {
        throw new Error('Failed to create webhook: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { webhookId: webhook.id, url: webhook.url });
      return buildResponse({ success: true, webhookId: webhook.id, url: webhook.url });
    }
  );
}
