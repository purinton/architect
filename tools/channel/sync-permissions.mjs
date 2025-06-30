export default async function ({ channelId, log, discord, buildResponse, toolName }) {
  if (!channelId) return buildResponse({ error: 'channelId required for sync-permissions.' });
  const channel = discord.channels.cache.get(Array.isArray(channelId) ? channelId[0] : channelId);
  if (!channel || !channel.parent) return buildResponse({ error: 'Channel not found or has no parent to sync with.' });
  await channel.lockPermissions();
  return buildResponse({ synced: true, channelId: channel.id, parentId: channel.parentId });
}
