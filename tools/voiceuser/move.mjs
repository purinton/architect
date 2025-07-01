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
  if (!voiceUserSettings?.channelId) {
    log.error(`[${toolName}] channelId required for move.`);
    return buildResponse({ error: 'channelId required for move.' });
  }
  await member.voice.setChannel(voiceUserSettings.channelId);
  log.debug(`[${toolName}] User moved`, { userId, channelId: voiceUserSettings.channelId });
  return buildResponse({ moved: true, userId, channelId: voiceUserSettings.channelId });
}
