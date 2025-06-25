import { z, buildResponse } from '@purinton/mcp-server';

// Tool: delete-webhook
// Deletes a webhook by its ID.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Delete a webhook by its ID.',
    {
      guildId: z.string(),
      channelId: z.string(),
      webhookId: z.string(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, channelId, webhookId, reason } = _args;
      const guild = await discord.helpers.getGuild(discord, guildId);
      const channel = await discord.helpers.getChannel(guild, channelId);
      const webhook = channel.webhooks.cache.get(webhookId);
      if (!webhook) throw new Error('Webhook not found');
      try {
        await webhook.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete webhook: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { webhookId });
      return buildResponse({ success: true, webhookId });
    }
  );
}
