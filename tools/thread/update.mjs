export default async function ({ threadId, threadSettings, log, discord, buildResponse, toolName }) {
  const threadIds = Array.isArray(threadId) ? threadId.filter(Boolean) : threadId ? [threadId].filter(Boolean) : [];
  let settingsArr = Array.isArray(threadSettings) ? threadSettings : threadSettings ? [threadSettings] : [];
  if (!threadIds.length || !settingsArr.length) {
    log.error(`[${toolName}] threadId(s) and threadSettings required for update.`);
    return buildResponse({ error: 'threadId(s) and threadSettings required for update.' });
  }
  const results = [];
  for (let i = 0; i < threadIds.length; i++) {
    const tid = threadIds[i];
    const settings = settingsArr[i] || settingsArr[0];
    const thread = discord.channels.cache.get(tid);
    if (!thread || !thread.isThread()) {
      results.push({ error: 'Thread not found', id: tid });
      continue;
    }
    const cleanedSettings = Object.fromEntries(Object.entries(settings).filter(([_, v]) => v !== undefined && v !== null));
    await thread.edit(cleanedSettings);
    log.debug(`[${toolName}] Thread updated`, { id: thread.id });
    results.push({ updated: true, id: thread.id });
  }
  return buildResponse({ results });
}
