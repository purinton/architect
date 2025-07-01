export default async function ({ channelId, messageId, log, discord, buildResponse, toolName }) {
  const channel = discord.channels.cache.get(channelId);
  if (!channel || !channel.messages) return buildResponse({ error: 'Channel not found or cannot pin.' });
  if (!messageId) return buildResponse({ error: 'messageId required for pin.' });
  const msg = await channel.messages.fetch(messageId);
  if (!msg) return buildResponse({ error: 'Message not found.' });
  await msg.pin();
  return buildResponse({ pinned: true, messageId });
}
