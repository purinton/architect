export default async function ({ channelId, webhookSettings, log, discord, buildResponse, toolName }) {
  if (!channelId) return buildResponse({ error: 'channelId required for webhook methods.' });
  const channel = discord.channels.cache.get(Array.isArray(channelId) ? channelId[0] : channelId);
  if (!channel || !channel.createWebhook) return buildResponse({ error: 'Channel not found or cannot create webhooks.' });
  if (!webhookSettings?.name) return buildResponse({ error: 'name required for webhook-create.' });
  const webhook = await channel.createWebhook({
    name: webhookSettings.name,
    avatar: webhookSettings.avatar,
    reason: webhookSettings.reason,
  });
  return buildResponse({ created: true, id: webhook.id, url: webhook.url });
}
