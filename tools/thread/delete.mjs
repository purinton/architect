export default async function ({ threadId, log, discord, buildResponse, toolName }) {
  const threadIds = Array.isArray(threadId) ? threadId.filter(Boolean) : threadId ? [threadId].filter(Boolean) : [];
  if (!threadIds.length) {
    log.error(`[${toolName}] threadId(s) required for delete.`);
    return buildResponse({ error: 'threadId(s) required for delete.' });
  }
  const results = [];
  for (const tid of threadIds) {
    const thread = discord.channels.cache.get(tid);
    if (!thread || !thread.isThread()) {
      results.push({ error: 'Thread not found', id: tid });
      continue;
    }
    await thread.delete();
    log.debug(`[${toolName}] Thread deleted`, { id: tid });
    results.push({ deleted: true, id: tid });
  }
  return buildResponse({ results });
}
