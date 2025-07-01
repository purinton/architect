export default async function ({ guildId, userId, moderateSettings, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) {
    log.error(`[${toolName}] Guild not found.`, { guildId });
    return buildResponse({ error: 'Guild not found.' });
  }
  if (!userId) {
    log.error(`[${toolName}] userId required for kick.`);
    return buildResponse({ error: 'userId required for this method.' });
  }
  const member = guild.members.cache.get(userId);
  if (!member) {
    log.error(`[${toolName}] Member not found for kick.`, { userId });
    return buildResponse({ error: 'Member not found.' });
  }
  await member.kick(moderateSettings?.reason);
  log.debug(`[${toolName}] User kicked`, { userId });
  return buildResponse({ kicked: true, userId });
}
