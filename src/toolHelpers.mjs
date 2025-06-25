// toolHelpers.mjs

import { PermissionsBitField } from 'discord.js';

/**
 * Fetch and validate a Guild by ID.
 * @param {string} guildId
 * @returns {import('discord.js').Guild}
 * @throws Error if not found
 */
export function getGuild(guildId) {
  const guild = global.discord.guilds.cache.get(guildId);
  if (!guild) throw new Error('Guild not found.');
  return guild;
}

/**
 * Fetch and validate a Channel by ID.
 * @param {import('discord.js').Guild} guild
 * @param {string} channelId
 * @returns {import('discord.js').GuildChannel}
 * @throws Error if not found
 */
export async function getChannel(guild, channelId) {
  let channel = guild.channels.cache.get(channelId);
  if (!channel) {
    channel = await guild.channels.fetch(channelId).catch(() => null);
  }
  if (!channel) throw new Error('Channel not found.');
  return channel;
}

/**
 * Fetch and validate a GuildMember by ID.
 * @param {import('discord.js').Guild} guild
 * @param {string} memberId
 * @returns {import('discord.js').GuildMember}
 * @throws Error if not found
 */
export async function getMember(guild, memberId) {
  let member = guild.members.cache.get(memberId);
  if (!member) {
    member = await guild.members.fetch(memberId).catch(() => null);
  }
  if (!member) throw new Error('Member not found. Try discord-list-members first.');
  return member;
}

/**
 * Fetch and validate a Role by ID.
 * @param {import('discord.js').Guild} guild
 * @param {string} roleId
 * @returns {import('discord.js').Role}
 * @throws Error if not found
 */
export async function getRole(guild, roleId) {
  let role = guild.roles.cache.get(roleId);
  if (!role) {
    role = await guild.roles.fetch(roleId).catch(() => null);
  }
  if (!role) throw new Error('Role not found. Please re-run with a valid Role ID.');
  return role;
}

/**
 * Fetch and validate a Thread by ID.
 * @param {import('discord.js').ThreadManager|import('discord.js').GuildChannel} channel
 * @param {string} threadId
 * @returns {import('discord.js').ThreadChannel}
 * @throws Error if not found
 */
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

/**
 * Fetch and validate a Message by ID.
 * @param {import('discord.js').TextChannel} channel
 * @param {string} messageId
 * @returns {import('discord.js').Message}
 * @throws Error if not found
 */
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

/**
 * Recursively remove undefined, null, empty string, or empty-array values.
 * @param {object|array} obj
 * @returns {object|array}
 */
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

/**
 * Convert ALL_CAPS permission names to PascalCase (SendMessages, ManageChannels, etc.).
 * @param {string} perm
 * @returns {string}
 */
export function toPascalCasePerms(perm) {
  if (typeof perm !== 'string') return perm;
  return perm
    .toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Wrap a plain JS object into the standard tool response payload.
 * @param {any} data
 * @returns {{ content: [ { type: 'text', text: string } ] }}
 */
export function buildResponse(data) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Wrap an action handler to automatically build a response.
 * Catches any thrown Error and rethrows to let the framework handle it.
 * @param {(args: any) => Promise<any>} action
 * @returns {(args: any) => Promise<any>}
 */
export function wrapAction(action) {
  return async (args) => {
    const result = await action(args);
    return buildResponse(result);
  };
}

/**
 * Normalize an embed argument or return undefined.
 * @param {object|null|undefined} embed
 * @returns {object|undefined}
 */
export function parseEmbed(embed) {
  if (!embed) return undefined;
  return embed;
}

/**
 * Merge or replace permission overwrites.
 * @param {import('discord.js').PermissionOverwritesManager | import('discord.js').Collection<string, import('discord.js').PermissionOverwrite>} existingCache
 * @param {Array<{id: string, type: 'role'|'member', allow?: string[], deny?: string[]}>} newOverrides
 * @param {boolean} merge
 * @returns {Array<object>}
 */
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

/**
 * Fetch, filter, and return messages based on given criteria.
 * @param {import('discord.js').TextChannel} channel
 * @param {{ limit?: number, bot?: boolean, embedOnly?: boolean, userId?: string, contains?: string }} filters
 * @returns {Promise<import('discord.js').Message[]>}
 */
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

/**
 * Fetch and normalize audit log entries.
 * @param {import('discord.js').Guild} guild
 * @param {{ actionType?: number, userId?: string, limit?: number, before?: string }} options
 * @returns {Promise<Array<object>>}
 */
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

/**
 * Ensure an array of IDs all exist in the guild (roles or channels).
 * @param {import('discord.js').Guild} guild
 * @param {string[]} ids
 * @param {'role'|'channel'} type
 * @returns {string[]}
 * @throws Error if any ID is invalid
 */
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