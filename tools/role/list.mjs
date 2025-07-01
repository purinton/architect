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
  const roles = guild.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.color, position: r.position }));
  log.debug(`[${toolName}] Roles listed`, { count: roles.length });
  return buildResponse({ roles });
}
