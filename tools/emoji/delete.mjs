export default async function ({ guildId, emojiId, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) return buildResponse({ error: 'Guild not found.' });
  if (!emojiId) return buildResponse({ error: 'emojiId required for delete.' });
  const emoji = guild.emojis.cache.get(emojiId);
  if (!emoji) return buildResponse({ error: 'Emoji not found.' });
  await emoji.delete();
  return buildResponse({ deleted: true, id: emojiId });
}
