export default async function ({ guildId, auditSettings, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) {
    log.error(`[${toolName}] Guild not found.`, { guildId });
    return buildResponse({ error: 'Guild not found.' });
  }
  log.debug(`[${toolName}] Fetching audit logs`, { guildId, auditSettings });
  // Clean auditSettings: remove empty string, null, or undefined values
  const options = Object.fromEntries(
    Object.entries(auditSettings || {}).filter(
      ([_, value]) =>
        value !== undefined &&
        value !== null &&
        !(typeof value === 'string' && value.trim() === '')
    )
  );
  log.debug(`[${toolName}] Cleaned audit log options`, { options });
  const logs = await guild.fetchAuditLogs(options);
  log.debug(`[${toolName}] Audit logs fetched`, { count: logs.entries.size });
  return buildResponse({ entries: logs.entries.map(e => e.toJSON()) });
}
