// helpers.mjs
export function getGuild(discord, guildId) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) throw new Error('Guild not found.');
  return guild;
}

export async function getChannel(guild, channelId) {
  let channel = guild.channels.cache.get(channelId);
  if (!channel) {
    channel = await guild.channels.fetch(channelId).catch(() => null);
  }
  if (!channel) throw new Error('Channel not found.');
  return channel;
}

export async function getMember(guild, memberId) {
  let member = guild.members.cache.get(memberId);
  if (!member) {
    member = await guild.members.fetch(memberId).catch(() => null);
  }
  if (!member) throw new Error('Member not found. Try discord-list-members first.');
  return member;
}

export async function getRole(guild, roleId) {
  let role = guild.roles.cache.get(roleId);
  if (!role) {
    role = await guild.roles.fetch(roleId).catch(() => null);
  }
  if (!role) throw new Error('Role not found. Please re-run with a valid Role ID.');
  return role;
}

export async function getThread(channel, threadId) {
  if (!channel.threads || typeof channel.threads.fetch !== 'function') {
    throw new Error('Channel cannot fetch threads.');
  }
  const thread = await channel.threads.fetch(threadId).catch(err => {
    throw new Error('Failed to fetch thread: ' + err.message);
  });
  if (!thread) throw new Error('Thread not found.');
  return thread;
}

export async function getMessage(channel, messageId) {
  if (!channel.messages || typeof channel.messages.fetch !== 'function') {
    throw new Error('Channel cannot fetch messages.');
  }
  const message = await channel.messages.fetch(messageId).catch(err => {
    throw new Error('Failed to fetch message: ' + err.message);
  });
  if (!message) throw new Error('Message not found.');
  return message;
}

export function cleanOptions(obj) {
  if (obj === null || obj === undefined) return undefined;
  if (Array.isArray(obj)) {
    const arr = obj
      .map(v => cleanOptions(v))
      .filter(v => v !== undefined);
    return arr.length ? arr : undefined;
  }
  if (typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === null) continue;
      if (typeof v === 'string' && v.trim() === '') continue;
      const cleaned = cleanOptions(v);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return obj;
}

export function toPascalCasePerms(perm) {
  if (typeof perm !== 'string') return perm;
  return perm
    .toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function wrapAction(action) {
  return async (args) => {
    const result = await action(args);
    return buildResponse(result);
  };
}

export function parseEmbed(embed) {
  if (!embed) return undefined;
  return embed;
}

export function mergePermissionOverwrites(existingCache, newOverrides, merge = false) {
  // PascalCase allow/deny
  let overrides = newOverrides.map(o => ({
    id: o.id,
    type: o.type,
    allow: o.allow?.map(toPascalCasePerms),
    deny: o.deny?.map(toPascalCasePerms),
  }));
  if (merge && existingCache && existingCache.cache) {
    for (const po of existingCache.cache.values()) {
      const key = po.id + ':' + po.type;
      if (!overrides.find(o => o.id + ':' + o.type === key)) {
        overrides.push({
          id: po.id,
          type: po.type === 0 ? 'role' : 'member',
          allow: po.allow?.toArray?.(),
          deny: po.deny?.toArray?.(),
        });
      }
    }
  }
  return overrides;
}

export async function fetchAndFilterMessages(channel, {
  limit = 100,
  bot,
  embedOnly = false,
  userId,
  contains,
} = {}) {
  if (!channel.messages || typeof channel.messages.fetch !== 'function') {
    throw new Error('Channel cannot fetch messages.');
  }
  const fetched = await channel.messages.fetch({ limit }).catch(err => {
    throw new Error('Failed to fetch messages: ' + err.message);
  });
  let msgs = Array.from(fetched.values());
  if (bot !== undefined) msgs = msgs.filter(m => m.author.bot === bot);
  if (embedOnly) msgs = msgs.filter(m => m.embeds.length > 0);
  if (userId) msgs = msgs.filter(m => m.author.id === userId);
  if (contains) msgs = msgs.filter(m => m.content.includes(contains));
  // Discord only allows bulk delete within 14 days
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  msgs = msgs.filter(m => m.createdTimestamp > cutoff);
  return msgs;
}

export async function fetchAuditLogEntries(guild, {
  actionType,
  userId,
  limit = 50,
  before,
} = {}) {
  const opts = { limit };
  if (actionType !== undefined) opts.type = actionType;
  if (userId) opts.user = userId;
  if (before) opts.before = before;
  const logs = await guild.fetchAuditLogs(opts).catch(err => {
    throw new Error('Failed to fetch audit logs: ' + err.message);
  });
  return Array.from(logs.entries.values()).map(e => ({
    id: e.id,
    action: e.action,
    actionType: e.actionType,
    targetType: e.targetType,
    targetId: e.targetId,
    executor: e.executor ? {
      id: e.executor.id,
      username: e.executor.username,
      discriminator: e.executor.discriminator,
    } : undefined,
    reason: e.reason,
    changes: e.changes,
    createdAt: e.createdAt,
  }));
}

export function ensureArrayOfIds(guild, ids, type) {
  const valid = ids.filter(id => {
    if (type === 'role') return guild.roles.cache.has(id);
    if (type === 'channel') return guild.channels.cache.has(id);
    return false;
  });
  if (valid.length !== ids.length) {
    throw new Error(`One or more ${type} IDs are invalid for this guild.`);
  }
  return valid;
}