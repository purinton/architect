export default async function ({ channelId, messageIds, log, discord, buildResponse, toolName }) {
  const channel = discord.channels.cache.get(channelId);
  if (!channel || !channel.bulkDelete) return buildResponse({ error: 'Channel not found or cannot bulk delete.' });
  if (!messageIds || !messageIds.length) return buildResponse({ error: 'messageIds required for bulkDelete.' });
  const deleted = await channel.bulkDelete(messageIds);
  return buildResponse({ deleted: true, count: deleted.size });
}
