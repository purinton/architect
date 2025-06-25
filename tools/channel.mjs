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

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create, list, get, update, or delete a channel by ID.',
    {
      guildId: z.string().optional(),
      channelId: z.string().optional(),
      method: z.enum(['create', 'list', 'get', 'update', 'delete']),
      channelSettings: channelSettingsSchema.nullable().optional(),
    },
    async (_args, _extra) => {
      log.debug(`[${toolName}] Request`, { _args });
      const { guildId, channelId, method, channelSettings } = _args;
      if (method === 'create') {
        if (!guildId || !channelSettings || !channelSettings.name) {
          log.error(`[${toolName}] guildId and channelSettings.name required for create.`);
          throw new Error('guildId and channelSettings.name required for create.');
        }
        const guild = discord.guilds.cache.get(guildId);
        if (!guild) {
          log.error(`[${toolName}] Guild not found.`, { guildId });
          throw new Error('Guild not found.');
        }
        const created = await guild.channels.create(channelSettings.name, channelSettings);
        log.debug(`[${toolName}] Channel created`, { id: created.id });
        return buildResponse({ created: true, id: created.id, name: created.name });
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
        if (!channelId) {
          log.error(`[${toolName}] channelId required for get.`);
          throw new Error('channelId required for get.');
        }
        const channel = discord.channels.cache.get(channelId);
        if (!channel) {
          log.error(`[${toolName}] Channel not found.`, { channelId });
          throw new Error('Channel not found.');
        }
        log.debug(`[${toolName}] Channel found`, { id: channel.id });
        return buildResponse({
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
        });
      } else if (method === 'update') {
        if (!channelId || !channelSettings) {
          log.error(`[${toolName}] channelId and channelSettings required for update.`);
          throw new Error('channelId and channelSettings required for update.');
        }
        const channel = discord.channels.cache.get(channelId);
        if (!channel) {
          log.error(`[${toolName}] Channel not found.`, { channelId });
          throw new Error('Channel not found.');
        }
        // Clean channelSettings
        const cleanedSettings = Object.fromEntries(Object.entries(channelSettings).filter(([_, v]) => v !== undefined && v !== null));
        await channel.edit(cleanedSettings);
        log.debug(`[${toolName}] Channel updated`, { id: channel.id });
        return buildResponse({ updated: true, id: channel.id });
      } else if (method === 'delete') {
        if (!channelId) {
          log.error(`[${toolName}] channelId required for delete.`);
          throw new Error('channelId required for delete.');
        }
        const channel = discord.channels.cache.get(channelId);
        if (!channel) {
          log.error(`[${toolName}] Channel not found.`, { channelId });
          throw new Error('Channel not found.');
        }
        await channel.delete();
        log.debug(`[${toolName}] Channel deleted`, { id: channelId });
        return buildResponse({ deleted: true, id: channelId });
      } else {
        log.error(`[${toolName}] Invalid method.`, { method });
        throw new Error('Invalid method.');
      }
    }
  );
}
