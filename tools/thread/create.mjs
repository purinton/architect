export default async function ({ channelId, threadSettings, log, discord, buildResponse, toolName }) {
  let settingsArr = Array.isArray(threadSettings) ? threadSettings : threadSettings ? [threadSettings] : [];
  settingsArr = settingsArr.filter(s => s && typeof s.name === 'string' && s.name.trim());
  log.debug(`[${toolName}] Final settingsArr for create`, { settingsArr });
  if (!channelId || !settingsArr.length) {
    log.error(`[${toolName}] channelId and valid threadSettings (with name) required for create.`);
    return buildResponse({ error: 'channelId and valid threadSettings (with name) required for create.' });
  }
  const channel = discord.channels.cache.get(channelId);
  if (!channel || !channel.threads) {
    log.error(`[${toolName}] Channel not found or does not support threads.`, { channelId });
    return buildResponse({ error: 'Channel not found or does not support threads.' });
  }
  const results = [];
  for (const settings of settingsArr) {
    const created = await channel.threads.create({ ...settings });
    log.debug(`[${toolName}] Thread created`, { id: created.id });
    results.push({ created: true, id: created.id, name: created.name });
  }
  return buildResponse({ results });
}
