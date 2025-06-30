export default async function ({ channelId, channelSettings, log, discord, buildResponse, cleanSettingsForType, toolName }) {
  const channelIds = Array.isArray(channelId) ? channelId.filter(Boolean) : channelId ? [channelId].filter(Boolean) : [];
  let settingsArr = Array.isArray(channelSettings) ? channelSettings : channelSettings ? [channelSettings] : [];
  if (!channelIds.length || !settingsArr.length) {
    log.error(`[${toolName}] channelId(s) and channelSettings required for update.`);
    return buildResponse({ error: 'channelId(s) and channelSettings required for update.' });
  }
  const results = [];
  for (let i = 0; i < channelIds.length; i++) {
    const cid = channelIds[i];
    const settings = settingsArr[i] || settingsArr[0];
    const channel = discord.channels.cache.get(cid);
    if (!channel) {
      results.push({ error: 'Channel not found', id: cid });
      continue;
    }
    const cleanedSettings = cleanSettingsForType(settings, channel.type);
    await channel.edit(cleanedSettings);
    log.debug(`[${toolName}] Channel updated`, { id: channel.id });
    results.push({ updated: true, id: channel.id });
  }
  return buildResponse({ results });
}
