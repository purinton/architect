export default async function ({ guildId, channelSettings, log, discord, buildResponse, cleanSettingsForType, toolName }) {
  let settingsArr = Array.isArray(channelSettings) ? channelSettings : channelSettings ? [channelSettings] : [];
  settingsArr = settingsArr.filter(s => s && typeof s.name === 'string' && s.name.trim() && typeof s.type === 'number');
  log.debug(`[${toolName}] Final settingsArr for create`, { settingsArr });
  if (!guildId || !settingsArr.length) {
    log.error(`[${toolName}] guildId and valid channelSettings (with name and type) required for create.`);
    return buildResponse({ error: 'guildId and valid channelSettings (with name and type) required for create.' });
  }
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) {
    log.error(`[${toolName}] Guild not found.`, { guildId });
    return buildResponse({ error: 'Guild not found.' });
  }
  const results = [];
  for (const settings of settingsArr) {
    // Remove permissionOverwrites if present
    const { permissionOverwrites, ...settingsWithoutPerms } = settings;
    const cleaned = cleanSettingsForType(settingsWithoutPerms, settings.type);
    const created = await guild.channels.create({ ...cleaned });
    log.debug(`[${toolName}] Channel created`, { id: created.id });
    results.push({ created: true, id: created.id, name: created.name });
  }
  return buildResponse({ results });
}
