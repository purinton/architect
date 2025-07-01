export default async function ({ guildId, userId, moderateSettings, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) {
    log.error(`[${toolName}] Guild not found.`, { guildId });
    return buildResponse({ error: 'Guild not found.' });
  }
  if (!userId) {
    log.error(`[${toolName}] userId required for ban.`);
    return buildResponse({ error: 'userId required for this method.' });
  }
  const options = {};
  if (moderateSettings?.reason) options.reason = moderateSettings.reason;
  if (moderateSettings?.deleteMessageSeconds) options.deleteMessageSeconds = moderateSettings.deleteMessageSeconds;
  await guild.members.ban(userId, options);
  log.debug(`[${toolName}] User banned`, { userId });
  return buildResponse({ banned: true, userId });
}
