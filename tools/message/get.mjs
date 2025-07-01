export default async function ({ channelId, limit, log, discord, buildResponse, toolName }) {
  const channel = discord.channels.cache.get(channelId);
  if (!channel || !channel.messages) return buildResponse({ error: 'Channel not found or cannot get messages.' });
  const msgs = await channel.messages.fetch({ limit: Math.min(limit || 50, 100) });
  return buildResponse({ messages: msgs.map(m => ({ id: m.id, content: m.content, author: m.author.id })) });
}
