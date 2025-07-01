export default async function ({ guildId, userId, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) {
    log.error(`[${toolName}] Guild not found.`, { guildId });
    return buildResponse({ error: 'Guild not found.' });
  }
  if (!userId) {
    log.error(`[${toolName}] userId required for unban.`);
    return buildResponse({ error: 'userId required for this method.' });
  }
  await guild.members.unban(userId);
  log.debug(`[${toolName}] User unbanned`, { userId });
  return buildResponse({ unbanned: true, userId });
}
