export default async function ({ guildId, userId, voiceUserSettings, log, discord, buildResponse, toolName }) {
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
  if (typeof voiceUserSettings?.deafen !== 'boolean') {
    log.error(`[${toolName}] deafen (boolean) required for serverDeafen.`);
    return buildResponse({ error: 'deafen (boolean) required for serverDeafen.' });
  }
  await member.voice.setDeaf(voiceUserSettings.deafen);
  log.debug(`[${toolName}] User serverDeafen set`, { userId, deafen: voiceUserSettings.deafen });
  return buildResponse({ serverDeafen: true, userId, deafen: voiceUserSettings.deafen });
}
