export default async function ({ guildId, emojiSettings, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) return buildResponse({ error: 'Guild not found.' });
  if (!emojiSettings?.name || !emojiSettings?.image) return buildResponse({ error: 'name and image required for create.' });
  const emoji = await guild.emojis.create({
    name: emojiSettings.name,
    image: emojiSettings.image,
    roles: emojiSettings.roles,
    reason: emojiSettings.reason,
  });
  return buildResponse({ created: true, id: emoji.id, name: emoji.name });
}
