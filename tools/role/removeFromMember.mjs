export default async function ({ guildId, memberRole, log, discord, buildResponse, toolName }) {
  if (!guildId || !memberRole) {
    log.error(`[${toolName}] guildId and memberRole required for removeFromMember.`);
    return buildResponse({ error: 'guildId and memberRole required.' });
  }
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) {
    log.error(`[${toolName}] Guild not found.`, { guildId });
    return buildResponse({ error: 'Guild not found.' });
  }
  const memberIds = Array.isArray(memberRole.memberId) ? memberRole.memberId : [memberRole.memberId];
  const roleIdsArr = Array.isArray(memberRole.roleId) ? memberRole.roleId : [memberRole.roleId];
  const results = [];
  for (const memberId of memberIds) {
    const member = guild.members.cache.get(memberId);
    if (!member) {
      results.push({ error: 'Member not found', memberId });
      continue;
    }
    for (const rid of roleIdsArr) {
      await member.roles.remove(rid);
      log.debug(`[${toolName}] Role removed from member`, { memberId, rid });
      results.push({ removed: true, memberId, roleId: rid });
    }
  }
  return buildResponse({ results });
}
