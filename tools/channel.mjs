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

// Channel type constants (Discord.js v14)
const VOICE_TYPES = [2, 13]; // 2: GUILD_VOICE, 13: GUILD_STAGE_VOICE
const VOICE_ONLY_SETTINGS = ['bitrate', 'userLimit'];
const NON_VOICE_ONLY_SETTINGS = ['topic', 'nsfw', 'rateLimitPerUser'];

function cleanSettingsForType(settings, type) {
  const cleaned = { ...settings };
  if (VOICE_TYPES.includes(type)) {
    // Remove non-voice-only settings
    for (const key of NON_VOICE_ONLY_SETTINGS) delete cleaned[key];
  } else {
    // Remove voice-only settings
    for (const key of VOICE_ONLY_SETTINGS) delete cleaned[key];
  }
  return cleaned;
}

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create, list, get, update, or delete one or more channels by ID.',
    {
      guildId: z.string().optional(),
      channelId: z.union([z.string(), z.array(z.string())]).optional(),
      method: z.enum(['create', 'list', 'get', 'update', 'delete']),
      channelSettings: z.union([channelSettingsSchema, z.array(channelSettingsSchema)]).nullable().optional(),
    },
    async (_args, _extra) => {
      log.debug(`[${toolName}] Request`, { _args });
      const { guildId, channelId, method, channelSettings } = _args;
      // For create, ignore channelId entirely
      const channelIds = method === 'create' ? [] : Array.isArray(channelId) ? channelId.filter(Boolean) : channelId ? [channelId].filter(Boolean) : [];
      let settingsArr = Array.isArray(channelSettings) ? channelSettings : channelSettings ? [channelSettings] : [];
      if (method === 'create') {
        // Filter out invalid settings (missing name or type)
        settingsArr = settingsArr.filter(s => s && typeof s.name === 'string' && s.name.trim() && typeof s.type === 'number');
        log.debug(`[${toolName}] Final settingsArr for create`, { settingsArr });
        if (!guildId || !settingsArr.length) {
          log.error(`[${toolName}] guildId and valid channelSettings (with name and type) required for create.`);
          throw new Error('guildId and valid channelSettings (with name and type) required for create.');
        }
        const guild = discord.guilds.cache.get(guildId);
        if (!guild) {
          log.error(`[${toolName}] Guild not found.`, { guildId });
          throw new Error('Guild not found.');
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
          throw new Error('guildId required for list.');
        }
        const guild = discord.guilds.cache.get(guildId);
        if (!guild) {
          log.error(`[${toolName}] Guild not found.`, { guildId });
          throw new Error('Guild not found.');
        }
        const channels = guild.channels.cache.map(c => ({ id: c.id, name: c.name, type: c.type }));
        log.debug(`[${toolName}] Channels listed`, { count: channels.length });
        return buildResponse({ channels });
      } else if (method === 'get') {
        if (!channelIds.length) {
          log.error(`[${toolName}] channelId(s) required for get.`);
          throw new Error('channelId(s) required for get.');
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
          throw new Error('channelId(s) and channelSettings required for update.');
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
          throw new Error('channelId(s) required for delete.');
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
      } else {
        log.error(`[${toolName}] Invalid method.`, { method });
        throw new Error('Invalid method.');
      }
    }
  );
}
