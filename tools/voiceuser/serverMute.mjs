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
  if (typeof voiceUserSettings?.mute !== 'boolean') {
    log.error(`[${toolName}] mute (boolean) required for serverMute.`);
    return buildResponse({ error: 'mute (boolean) required for serverMute.' });
  }
  await member.voice.setMute(voiceUserSettings.mute);
  log.debug(`[${toolName}] User serverMute set`, { userId, mute: voiceUserSettings.mute });
  return buildResponse({ serverMute: true, userId, mute: voiceUserSettings.mute });
}
