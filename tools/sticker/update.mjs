export default async function ({ guildId, stickerId, stickerSettings, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) return buildResponse({ error: 'Guild not found.' });
  if (!stickerId || !stickerSettings) return buildResponse({ error: 'stickerId and stickerSettings required for update.' });
  const sticker = guild.stickers.cache.get(stickerId);
  if (!sticker) return buildResponse({ error: 'Sticker not found.' });
  await sticker.edit(stickerSettings);
  return buildResponse({ updated: true, id: sticker.id });
}
