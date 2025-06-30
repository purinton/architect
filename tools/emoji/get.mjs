export default async function ({ guildId, emojiId, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) return buildResponse({ error: 'Guild not found.' });
  if (!emojiId) return buildResponse({ error: 'emojiId required for get.' });
  const emoji = guild.emojis.cache.get(emojiId);
  if (!emoji) return buildResponse({ error: 'Emoji not found.' });
  return buildResponse({ id: emoji.id, name: emoji.name, url: emoji.url, roles: emoji.roles.cache.map(r => r.id) });
}
