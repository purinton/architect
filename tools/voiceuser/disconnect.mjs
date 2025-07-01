export default async function ({ guildId, userId, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) {
    log.error(`[${toolName}] Guild not found.`, { guildId });
    return buildResponse({ error: 'Guild not found.' });
  }
  const member = guild.members.cache.get(userId);
  if (!member || !member.voice) {
    log.error(`[${toolName}] Member not found or not in voice.`, { userId });
    return buildResponse({ error: 'Member not found or not in voice.' });
  }
  await member.voice.disconnect();
  log.debug(`[${toolName}] User disconnected from voice`, { userId });
  return buildResponse({ disconnected: true, userId });
}
