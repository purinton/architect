import { z, buildResponse } from '@purinton/mcp-server';

const webhookSettingsSchema = z.object({
  name: z.string().optional(),
  avatar: z.string().optional(), // URL or base64
  reason: z.string().optional(),
});

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create, delete, or list webhooks for a channel.',
    {
      channelId: z.string(),
      method: z.enum(['create', 'delete', 'list']),
      webhookId: z.string().optional(),
      webhookSettings: webhookSettingsSchema.nullable().optional(),
    },
    async (_args, _extra) => {
      log.debug(`[${toolName}] Request`, { _args });
      const { channelId, method, webhookId, webhookSettings } = _args;
      const channel = discord.channels.cache.get(channelId);
      if (!channel || !channel.createWebhook) throw new Error('Channel not found or cannot create webhooks.');
      if (method === 'create') {
        if (!webhookSettings?.name) throw new Error('name required for create.');
        const webhook = await channel.createWebhook({
          name: webhookSettings.name,
          avatar: webhookSettings.avatar,
          reason: webhookSettings.reason,
        });
        return buildResponse({ created: true, id: webhook.id, url: webhook.url });
      } else if (method === 'delete') {
        if (!webhookId) throw new Error('webhookId required for delete.');
        const webhook = await discord.fetchWebhook(webhookId);
        if (!webhook) throw new Error('Webhook not found.');
        await webhook.delete();
        return buildResponse({ deleted: true, id: webhookId });
      } else if (method === 'list') {
        const webhooks = await channel.fetchWebhooks();
        return buildResponse({ webhooks: webhooks.map(w => ({ id: w.id, name: w.name, url: w.url })) });
      } else {
        throw new Error('Invalid method.');
      }
    }
  );
}
