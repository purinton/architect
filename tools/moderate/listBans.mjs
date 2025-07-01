export default async function ({ guildId, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) {
    log.error(`[${toolName}] Guild not found.`, { guildId });
    return buildResponse({ error: 'Guild not found.' });
  }
  const bans = await guild.bans.fetch();
  const banList = bans.map(ban => ({ userId: ban.user.id, tag: ban.user.tag, reason: ban.reason }));
  log.debug(`[${toolName}] Ban list fetched`, { count: banList.length });
  return buildResponse({ bans: banList });
}
