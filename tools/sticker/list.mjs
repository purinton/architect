export default async function ({ guildId, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) return buildResponse({ error: 'Guild not found.' });
  const stickers = guild.stickers.cache.map(s => ({ id: s.id, name: s.name, tags: s.tags }));
  return buildResponse({ stickers });
}
