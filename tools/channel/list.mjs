export default async function ({ guildId, log, discord, buildResponse, toolName }) {
  if (!guildId) {
    log.error(`[${toolName}] guildId required for list.`);
    return buildResponse({ error: 'guildId required for list.' });
  }
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) {
    log.error(`[${toolName}] Guild not found.`, { guildId });
    return buildResponse({ error: 'Guild not found.' });
  }
  const channels = guild.channels.cache.map(c => ({ id: c.id, name: c.name, type: c.type }));
  log.debug(`[${toolName}] Channels listed`, { count: channels.length });
  return buildResponse({ channels });
}
