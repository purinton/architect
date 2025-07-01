export default async function ({ channelId, messageId, emoji, log, discord, buildResponse, toolName }) {
  const channel = discord.channels.cache.get(channelId);
  if (!channel || !channel.messages) return buildResponse({ error: 'Channel not found or cannot react.' });
  if (!messageId || !emoji) return buildResponse({ error: 'messageId and emoji required for react.' });
  const msg = await channel.messages.fetch(messageId);
  if (!msg) return buildResponse({ error: 'Message not found.' });
  await msg.react(emoji);
  return buildResponse({ reacted: true, messageId, emoji });
}
