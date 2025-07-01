export default async function ({ guildId, stickerSettings, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) return buildResponse({ error: 'Guild not found.' });
  if (!stickerSettings?.name || !stickerSettings?.file || !stickerSettings?.tags) return buildResponse({ error: 'name, file, and tags required for create.' });
  const sticker = await guild.stickers.create({
    name: stickerSettings.name,
    description: stickerSettings.description,
    tags: stickerSettings.tags,
    file: stickerSettings.file,
    reason: stickerSettings.reason,
  });
  return buildResponse({ created: true, id: sticker.id, name: sticker.name });
}
