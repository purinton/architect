export default async function ({ guildId, stickerId, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) return buildResponse({ error: 'Guild not found.' });
  if (!stickerId) return buildResponse({ error: 'stickerId required for delete.' });
  const sticker = guild.stickers.cache.get(stickerId);
  if (!sticker) return buildResponse({ error: 'Sticker not found.' });
  await sticker.delete();
  return buildResponse({ deleted: true, id: stickerId });
}
