import { z } from 'zod';
import { getGuild, buildResponse } from '../toolHelpers.mjs';

// Tool: delete-webhook
// Deletes a webhook by its ID.
export default async function (server, toolName = 'discord-delete-webhook') {
  server.tool(
    toolName,
    'Delete a webhook by its ID.',
    {
      guildId: z.string(),
      webhookId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, webhookId, reason } = args;
      const guild = getGuild(guildId);
      let webhook;
      try {
        webhook = await guild.fetchWebhook(webhookId);
        if (!webhook) throw new Error('Webhook not found.');
        await webhook.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete webhook: ' + (err.message || err));
      }
      return buildResponse({ success: true, webhookId });
    }
  );
}
