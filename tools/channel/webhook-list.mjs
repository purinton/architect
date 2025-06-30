export default async function ({ channelId, log, discord, buildResponse, toolName }) {
  if (!channelId) return buildResponse({ error: 'channelId required for webhook methods.' });
  const channel = discord.channels.cache.get(Array.isArray(channelId) ? channelId[0] : channelId);
  if (!channel || !channel.createWebhook) return buildResponse({ error: 'Channel not found or cannot create webhooks.' });
  const webhooks = await channel.fetchWebhooks();
  return buildResponse({ webhooks: webhooks.map(w => ({ id: w.id, name: w.name, url: w.url })) });
}
