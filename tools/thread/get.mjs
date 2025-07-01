export default async function ({ threadId, log, discord, buildResponse, toolName }) {
  const threadIds = Array.isArray(threadId) ? threadId.filter(Boolean) : threadId ? [threadId].filter(Boolean) : [];
  if (!threadIds.length) {
    log.error(`[${toolName}] threadId(s) required for get.`);
    return buildResponse({ error: 'threadId(s) required for get.' });
  }
  const results = threadIds.map(tid => {
    const thread = discord.channels.cache.get(tid);
    if (!thread || !thread.isThread()) return { error: 'Thread not found', id: tid };
    log.debug(`[${toolName}] Thread found`, { id: thread.id });
    return {
      id: thread.id,
      name: thread.name,
      archived: thread.archived,
      autoArchiveDuration: thread.autoArchiveDuration,
      rateLimitPerUser: thread.rateLimitPerUser,
      parent: thread.parentId,
    };
  });
  return buildResponse({ results });
}
