export default async function ({ guildId, userId, moderateSettings, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) {
    log.error(`[${toolName}] Guild not found.`, { guildId });
    return buildResponse({ error: 'Guild not found.' });
  }
  if (!userId) {
    log.error(`[${toolName}] userId required for timeout.`);
    return buildResponse({ error: 'userId required for this method.' });
  }
  const member = guild.members.cache.get(userId);
  if (!member) {
    log.error(`[${toolName}] Member not found for timeout.`, { userId });
    return buildResponse({ error: 'Member not found.' });
  }
  if (!moderateSettings?.duration) {
    log.error(`[${toolName}] duration required for timeout.`);
    return buildResponse({ error: 'duration required for timeout.' });
  }
  await member.timeout(moderateSettings.duration, moderateSettings?.reason);
  log.debug(`[${toolName}] User timed out`, { userId });
  return buildResponse({ timedOut: true, userId, duration: moderateSettings.duration });
}
