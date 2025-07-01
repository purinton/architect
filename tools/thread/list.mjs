export default async function ({ channelId, log, discord, buildResponse, toolName }) {
  if (!channelId) {
    log.error(`[${toolName}] channelId required for list.`);
    return buildResponse({ error: 'channelId required for list.' });
  }
  const channel = discord.channels.cache.get(channelId);
  if (!channel || !channel.threads) {
    log.error(`[${toolName}] Channel not found or does not support threads.`, { channelId });
    return buildResponse({ error: 'Channel not found or does not support threads.' });
  }
  const threads = await channel.threads.fetch();
  const threadList = threads.threads.map(t => ({ id: t.id, name: t.name, archived: t.archived }));
  log.debug(`[${toolName}] Threads listed`, { count: threadList.length });
  return buildResponse({ threads: threadList });
}
