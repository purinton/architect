import { z, buildResponse } from '@purinton/mcp-server';

const threadSettingsSchema = z.object({
  name: z.string().optional(),
  autoArchiveDuration: z.number().optional(),
  rateLimitPerUser: z.number().optional(),
  type: z.number().optional(),
  reason: z.string().optional(),
});

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create, list, get, update, delete, or archive one or more threads by ID.',
    {
      channelId: z.string().optional(),
      threadId: z.union([z.string(), z.array(z.string())]).optional(),
      method: z.enum(['create', 'list', 'get', 'update', 'delete', 'archive']),
      threadSettings: z.union([threadSettingsSchema, z.array(threadSettingsSchema)]).nullable().optional(),
    },
    async (_args, _extra) => {
      log.debug(`[${toolName}] Request`, { _args });
      const { channelId, threadId, method, threadSettings } = _args;
      const threadIds = method === 'create' ? [] : Array.isArray(threadId) ? threadId.filter(Boolean) : threadId ? [threadId].filter(Boolean) : [];
      let settingsArr = Array.isArray(threadSettings) ? threadSettings : threadSettings ? [threadSettings] : [];
      if (method === 'create') {
        settingsArr = settingsArr.filter(s => s && typeof s.name === 'string' && s.name.trim());
        log.debug(`[${toolName}] Final settingsArr for create`, { settingsArr });
        if (!channelId || !settingsArr.length) {
          log.error(`[${toolName}] channelId and valid threadSettings (with name) required for create.`);
          throw new Error('channelId and valid threadSettings (with name) required for create.');
        }
        const channel = discord.channels.cache.get(channelId);
        if (!channel || !channel.threads) {
          log.error(`[${toolName}] Channel not found or does not support threads.`, { channelId });
          throw new Error('Channel not found or does not support threads.');
        }
        const results = [];
        for (const settings of settingsArr) {
          const created = await channel.threads.create({ ...settings });
          log.debug(`[${toolName}] Thread created`, { id: created.id });
          results.push({ created: true, id: created.id, name: created.name });
        }
        return buildResponse({ results });
      } else if (method === 'list') {
        if (!channelId) {
          log.error(`[${toolName}] channelId required for list.`);
          throw new Error('channelId required for list.');
        }
        const channel = discord.channels.cache.get(channelId);
        if (!channel || !channel.threads) {
          log.error(`[${toolName}] Channel not found or does not support threads.`, { channelId });
          throw new Error('Channel not found or does not support threads.');
        }
        const threads = await channel.threads.fetch();
        const threadList = threads.threads.map(t => ({ id: t.id, name: t.name, archived: t.archived }));
        log.debug(`[${toolName}] Threads listed`, { count: threadList.length });
        return buildResponse({ threads: threadList });
      } else if (method === 'get') {
        if (!threadIds.length) {
          log.error(`[${toolName}] threadId(s) required for get.`);
          throw new Error('threadId(s) required for get.');
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
      } else if (method === 'update') {
        if (!threadIds.length || !settingsArr.length) {
          log.error(`[${toolName}] threadId(s) and threadSettings required for update.`);
          throw new Error('threadId(s) and threadSettings required for update.');
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
      } else if (method === 'delete') {
        if (!threadIds.length) {
          log.error(`[${toolName}] threadId(s) required for delete.`);
          throw new Error('threadId(s) required for delete.');
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
      } else if (method === 'archive') {
        if (!threadIds.length) {
          log.error(`[${toolName}] threadId(s) required for archive.`);
          throw new Error('threadId(s) required for archive.');
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
      } else {
        log.error(`[${toolName}] Invalid method.`, { method });
        throw new Error('Invalid method.');
      }
    }
  );
}
