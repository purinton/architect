import { z, buildResponse } from '@purinton/mcp-server';

const emojiSettingsSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(), // base64 or URL
  roles: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create, delete, or get a guild emoji.',
    {
      guildId: z.string(),
      method: z.enum(['create', 'delete', 'get']),
      emojiId: z.string().optional(),
      emojiSettings: emojiSettingsSchema.nullable().optional(),
    },
    async (_args, _extra) => {
      try {
        log.debug(`[${toolName}] Request`, { _args });
        const { guildId, method, emojiId, emojiSettings } = _args;
        const guild = discord.guilds.cache.get(guildId);
        if (!guild) return buildResponse({ error: 'Guild not found.' });
        if (method === 'create') {
          if (!emojiSettings?.name || !emojiSettings?.image) return buildResponse({ error: 'name and image required for create.' });
          const emoji = await guild.emojis.create({
            name: emojiSettings.name,
            image: emojiSettings.image,
            roles: emojiSettings.roles,
            reason: emojiSettings.reason,
          });
          return buildResponse({ created: true, id: emoji.id, name: emoji.name });
        } else if (method === 'delete') {
          if (!emojiId) return buildResponse({ error: 'emojiId required for delete.' });
          const emoji = guild.emojis.cache.get(emojiId);
          if (!emoji) return buildResponse({ error: 'Emoji not found.' });
          await emoji.delete();
          return buildResponse({ deleted: true, id: emojiId });
        } else if (method === 'get') {
          if (!emojiId) return buildResponse({ error: 'emojiId required for get.' });
          const emoji = guild.emojis.cache.get(emojiId);
          if (!emoji) return buildResponse({ error: 'Emoji not found.' });
          return buildResponse({ id: emoji.id, name: emoji.name, url: emoji.url, roles: emoji.roles.cache.map(r => r.id) });
        } else {
          return buildResponse({ error: 'Invalid method.' });
        }
      } catch (err) {
        return buildResponse({ error: err?.message || String(err) });
      }
    }
  );
}
