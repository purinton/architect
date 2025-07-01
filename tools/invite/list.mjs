export default async function ({ channelId, log, discord, buildResponse, toolName }) {
  const channel = discord.channels.cache.get(channelId);
  if (!channel || !channel.fetchInvites) return buildResponse({ error: 'Channel not found or cannot fetch invites.' });
  const invites = await channel.fetchInvites();
  return buildResponse({ invites: invites.map(i => ({ code: i.code, url: i.url, uses: i.uses })) });
}
