import { z, buildResponse } from '@purinton/mcp-server';

const channelSettingsSchema = z.object({
  name: z.string().optional(),
  type: z.number().optional(), // Discord.js channel type
  topic: z.string().optional(),
  nsfw: z.boolean().optional(),
  bitrate: z.number().optional(),
  userLimit: z.number().optional(),
  parent: z.string().optional(),
  position: z.number().optional(),
  rateLimitPerUser: z.number().optional(),
  permissionOverwrites: z.any().optional(),
});

const webhookSettingsSchema = z.object({
  name: z.string().optional(),
  avatar: z.string().optional(), // URL or base64
  reason: z.string().optional(),
});

const permissionOverwriteSchema = z.object({
  id: z.string().describe("Role or user ID to apply the permission overwrite."),
  type: z.enum(['role', 'member']).describe("Type of overwrite: 'role' for role ID, 'member' for user ID"),
  allow: z.union([z.string(), z.number()]).optional().describe(
    "Permissions to allow, specified as a bitfield. Provide as integer or string (e.g. 1024 for VIEW_CHANNEL). Combine flags using bitwise OR."
  ),
  deny: z.union([z.string(), z.number()]).optional().describe(
    "Permissions to deny, specified as a bitfield. Provide as integer or string (e.g. 2048 for SEND_MESSAGES). Combine flags using bitwise OR."
  ),
});

const VOICE_TYPES = [2, 13]; // 2: GUILD_VOICE, 13: GUILD_STAGE_VOICE
const VOICE_ONLY_SETTINGS = ['bitrate', 'userLimit'];
const NON_VOICE_ONLY_SETTINGS = ['topic', 'nsfw', 'rateLimitPerUser'];

function cleanSettingsForType(settings, type) {
  const cleaned = { ...settings };
  if (VOICE_TYPES.includes(type)) {
    for (const key of NON_VOICE_ONLY_SETTINGS) delete cleaned[key];
  } else {
    for (const key of VOICE_ONLY_SETTINGS) delete cleaned[key];
  }
  return cleaned;
}

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create, list, get, update, delete channels, manage webhooks, and manage channel permissions.',
    {
      guildId: z.string().optional(),
      channelId: z.union([z.string(), z.array(z.string())]).optional(),
      method: z.enum([
        'create', 'list', 'get', 'update', 'delete',
        'webhook-create', 'webhook-delete', 'webhook-list',
        'get-permissions', 'set-permissions', 'sync-permissions'
      ]),
      channelSettings: z.union([channelSettingsSchema, z.array(channelSettingsSchema)]).nullable().optional(),
      webhookId: z.string().optional(),
      webhookSettings: webhookSettingsSchema.nullable().optional(),
      permissionOverwrites: z.array(permissionOverwriteSchema).optional(),
    },
    async (_args, _extra) => {
      try {
        log.debug(`[${toolName}] Request`, { _args });
        const { guildId, channelId, method, channelSettings, webhookId, webhookSettings, permissionOverwrites } = _args;
        const channelIds = method === 'create' ? [] : Array.isArray(channelId) ? channelId.filter(Boolean) : channelId ? [channelId].filter(Boolean) : [];
        let settingsArr = Array.isArray(channelSettings) ? channelSettings : channelSettings ? [channelSettings] : [];
        // Webhook methods
        if (method === 'webhook-create' || method === 'webhook-delete' || method === 'webhook-list') {
          if (!channelId) return buildResponse({ error: 'channelId required for webhook methods.' });
          const channel = discord.channels.cache.get(Array.isArray(channelId) ? channelId[0] : channelId);
          if (!channel || !channel.createWebhook) return buildResponse({ error: 'Channel not found or cannot create webhooks.' });
          if (method === 'webhook-create') {
            if (!webhookSettings?.name) return buildResponse({ error: 'name required for webhook-create.' });
            const webhook = await channel.createWebhook({
              name: webhookSettings.name,
              avatar: webhookSettings.avatar,
              reason: webhookSettings.reason,
            });
            return buildResponse({ created: true, id: webhook.id, url: webhook.url });
          } else if (method === 'webhook-delete') {
            if (!webhookId) return buildResponse({ error: 'webhookId required for webhook-delete.' });
            const webhook = await discord.fetchWebhook(webhookId);
            if (!webhook) return buildResponse({ error: 'Webhook not found.' });
            await webhook.delete();
            return buildResponse({ deleted: true, id: webhookId });
          } else if (method === 'webhook-list') {
            const webhooks = await channel.fetchWebhooks();
            return buildResponse({ webhooks: webhooks.map(w => ({ id: w.id, name: w.name, url: w.url })) });
          }
        }
        if (method === 'create') {
          settingsArr = settingsArr.filter(s => s && typeof s.name === 'string' && s.name.trim() && typeof s.type === 'number');
          log.debug(`[${toolName}] Final settingsArr for create`, { settingsArr });
          if (!guildId || !settingsArr.length) {
            log.error(`[${toolName}] guildId and valid channelSettings (with name and type) required for create.`);
            return buildResponse({ error: 'guildId and valid channelSettings (with name and type) required for create.' });
          }
          const guild = discord.guilds.cache.get(guildId);
          if (!guild) {
            log.error(`[${toolName}] Guild not found.`, { guildId });
            return buildResponse({ error: 'Guild not found.' });
          }
          const results = [];
          for (const settings of settingsArr) {
            const cleaned = cleanSettingsForType(settings, settings.type);
            const created = await guild.channels.create({ ...cleaned });
            log.debug(`[${toolName}] Channel created`, { id: created.id });
            results.push({ created: true, id: created.id, name: created.name });
          }
          return buildResponse({ results });
        } else if (method === 'list') {
          if (!guildId) {
            log.error(`[${toolName}] guildId required for list.`);
            return buildResponse({ error: 'guildId required for list.' });
          }
          const guild = discord.guilds.cache.get(guildId);
          if (!guild) {
            log.error(`[${toolName}] Guild not found.`, { guildId });
            return buildResponse({ error: 'Guild not found.' });
          }
          const channels = guild.channels.cache.map(c => ({ id: c.id, name: c.name, type: c.type }));
          log.debug(`[${toolName}] Channels listed`, { count: channels.length });
          return buildResponse({ channels });
        } else if (method === 'get') {
          if (!channelIds.length) {
            log.error(`[${toolName}] channelId(s) required for get.`);
            return buildResponse({ error: 'channelId(s) required for get.' });
          }
          const results = channelIds.map(cid => {
            const channel = discord.channels.cache.get(cid);
            if (!channel) return { error: 'Channel not found', id: cid };
            log.debug(`[${toolName}] Channel found`, { id: channel.id });
            return {
              id: channel.id,
              name: channel.name,
              type: channel.type,
              topic: channel.topic,
              nsfw: channel.nsfw,
              bitrate: channel.bitrate,
              userLimit: channel.userLimit,
              parent: channel.parentId,
              position: channel.position,
              rateLimitPerUser: channel.rateLimitPerUser,
            };
          });
          return buildResponse({ results });
        } else if (method === 'update') {
          if (!channelIds.length || !settingsArr.length) {
            log.error(`[${toolName}] channelId(s) and channelSettings required for update.`);
            return buildResponse({ error: 'channelId(s) and channelSettings required for update.' });
          }
          const results = [];
          for (let i = 0; i < channelIds.length; i++) {
            const cid = channelIds[i];
            const settings = settingsArr[i] || settingsArr[0];
            const channel = discord.channels.cache.get(cid);
            if (!channel) {
              results.push({ error: 'Channel not found', id: cid });
              continue;
            }
            const cleanedSettings = cleanSettingsForType(settings, channel.type);
            await channel.edit(cleanedSettings);
            log.debug(`[${toolName}] Channel updated`, { id: channel.id });
            results.push({ updated: true, id: channel.id });
          }
          return buildResponse({ results });
        } else if (method === 'delete') {
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
        } else if (method === 'get-permissions') {
          if (!channelId) return buildResponse({ error: 'channelId required for get-permissions.' });
          const channel = discord.channels.cache.get(Array.isArray(channelId) ? channelId[0] : channelId);
          if (!channel || !channel.permissionOverwrites) return buildResponse({ error: 'Channel not found or does not support permissions.' });
          const perms = channel.permissionOverwrites.cache.map(po => ({
            id: po.id,
            type: po.type,
            allow: po.allow?.bitfield?.toString() ?? po.allow?.toString(),
            deny: po.deny?.bitfield?.toString() ?? po.deny?.toString(),
          }));
          return buildResponse({ permissionOverwrites: perms });
        } else if (method === 'set-permissions') {
          if (!channelId) return buildResponse({ error: 'channelId required for set-permissions.' });
          if (!permissionOverwrites || !Array.isArray(permissionOverwrites)) return buildResponse({ error: 'permissionOverwrites array required for set-permissions.' });
          const channel = discord.channels.cache.get(Array.isArray(channelId) ? channelId[0] : channelId);
          if (!channel || !channel.permissionOverwrites) return buildResponse({ error: 'Channel not found or does not support permissions.' });
          // Set each overwrite
          for (const po of permissionOverwrites) {
            await channel.permissionOverwrites.edit(po.id, {
              allow: po.allow,
              deny: po.deny,
              type: po.type,
            });
          }
          return buildResponse({ updated: true, count: permissionOverwrites.length });
        } else if (method === 'sync-permissions') {
          if (!channelId) return buildResponse({ error: 'channelId required for sync-permissions.' });
          const channel = discord.channels.cache.get(Array.isArray(channelId) ? channelId[0] : channelId);
          if (!channel || !channel.parent) return buildResponse({ error: 'Channel not found or has no parent to sync with.' });
          await channel.lockPermissions();
          return buildResponse({ synced: true, channelId: channel.id, parentId: channel.parentId });
        } else {
          log.error(`[${toolName}] Invalid method.`, { method });
          return buildResponse({ error: 'Invalid method.' });
        }
      } catch (err) {
        return buildResponse({ error: err?.message || String(err) });
      }
    }
  );
}
