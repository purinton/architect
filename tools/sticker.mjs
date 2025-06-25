import { z, buildResponse } from '@purinton/mcp-server';

const stickerSettingsSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  file: z.any().optional(), // Buffer or URL
  reason: z.string().optional(),
});

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create, update, delete, or list guild stickers.',
    {
      guildId: z.string(),
      method: z.enum(['create', 'update', 'delete', 'list']),
      stickerId: z.string().optional(),
      stickerSettings: stickerSettingsSchema.nullable().optional(),
    },
    async (_args, _extra) => {
      log.debug(`[${toolName}] Request`, { _args });
      const { guildId, method, stickerId, stickerSettings } = _args;
      const guild = discord.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      if (method === 'create') {
        if (!stickerSettings?.name || !stickerSettings?.file || !stickerSettings?.tags) throw new Error('name, file, and tags required for create.');
        const sticker = await guild.stickers.create({
          name: stickerSettings.name,
          description: stickerSettings.description,
          tags: stickerSettings.tags,
          file: stickerSettings.file,
          reason: stickerSettings.reason,
        });
        return buildResponse({ created: true, id: sticker.id, name: sticker.name });
      } else if (method === 'update') {
        if (!stickerId || !stickerSettings) throw new Error('stickerId and stickerSettings required for update.');
        const sticker = guild.stickers.cache.get(stickerId);
        if (!sticker) throw new Error('Sticker not found.');
        await sticker.edit(stickerSettings);
        return buildResponse({ updated: true, id: sticker.id });
      } else if (method === 'delete') {
        if (!stickerId) throw new Error('stickerId required for delete.');
        const sticker = guild.stickers.cache.get(stickerId);
        if (!sticker) throw new Error('Sticker not found.');
        await sticker.delete();
        return buildResponse({ deleted: true, id: stickerId });
      } else if (method === 'list') {
        const stickers = guild.stickers.cache.map(s => ({ id: s.id, name: s.name, tags: s.tags }));
        return buildResponse({ stickers });
      } else {
        throw new Error('Invalid method.');
      }
    }
  );
}
