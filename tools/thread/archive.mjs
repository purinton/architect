export default async function ({ threadId, log, discord, buildResponse, toolName }) {
  const threadIds = Array.isArray(threadId) ? threadId.filter(Boolean) : threadId ? [threadId].filter(Boolean) : [];
  if (!threadIds.length) {
    log.error(`[${toolName}] threadId(s) required for archive.`);
    return buildResponse({ error: 'threadId(s) required for archive.' });
  }
  const results = [];
  for (const tid of threadIds) {
    const thread = discord.channels.cache.get(tid);
    if (!thread || !thread.isThread()) {
      results.push({ error: 'Thread not found', id: tid });
      continue;
    }
    await thread.setArchived(true);
    log.debug(`[${toolName}] Thread archived`, { id: tid });
    results.push({ archived: true, id: tid });
  }
  return buildResponse({ results });
}
