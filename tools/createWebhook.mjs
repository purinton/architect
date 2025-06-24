import { z } from 'zod';
import { getGuild, getChannel, buildResponse } from '../toolHelpers.mjs';

// Tool: create-webhook
// Creates a webhook in a specified channel.
export default async function (server, toolName = 'discord-create-webhook') {
  server.tool(
    toolName,
    'Create a webhook in a specified channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
      name: z.string(),
      avatar: z.string().optional(), // URL or base64
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, channelId, name, avatar, reason } = args;
      const guild = getGuild(guildId);
      const channel = await getChannel(guild, channelId);
      if (typeof channel.createWebhook !== 'function') throw new Error('Channel cannot create webhooks.');
      let webhook;
      try {
        webhook = await channel.createWebhook({ name, avatar, reason });
      } catch (err) {
        throw new Error('Failed to create webhook: ' + (err.message || err));
      }
      return buildResponse({ success: true, webhookId: webhook.id, url: webhook.url });
    }
  );
}
