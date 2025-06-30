export default async function ({ channelId, log, discord, buildResponse, toolName }) {
  const channelIds = Array.isArray(channelId) ? channelId.filter(Boolean) : channelId ? [channelId].filter(Boolean) : [];
  if (!channelIds.length) {
    log.error(`[${toolName}] channelId(s) required for delete.`);
    return buildResponse({ error: 'channelId(s) required for delete.' });
  }
  const results = [];
  for (const cid of channelIds) {
    const channel = discord.channels.cache.get(cid);
    if (!channel) {
      results.push({ error: 'Channel not found', id: cid });
      continue;
    }
    await channel.delete();
    log.debug(`[${toolName}] Channel deleted`, { id: cid });
    results.push({ deleted: true, id: cid });
  }
  return buildResponse({ results });
}
