export default async function ({ channelId, messageSettings, log, discord, buildResponse, toolName }) {
  const channel = discord.channels.cache.get(channelId);
  if (!channel || !channel.send) return buildResponse({ error: 'Channel not found or cannot send messages.' });
  if (!messageSettings?.content && !messageSettings?.embeds && !messageSettings?.files) return buildResponse({ error: 'content, embeds, or files required for send.' });
  const msg = await channel.send(messageSettings);
  return buildResponse({ sent: true, id: msg.id });
}
