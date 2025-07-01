export default async function ({ roleId, log, discord, buildResponse, toolName }) {
  const roleIds = Array.isArray(roleId) ? roleId.filter(Boolean) : roleId ? [roleId].filter(Boolean) : [];
  if (!roleIds.length) {
    log.error(`[${toolName}] roleId(s) required for delete.`);
    return buildResponse({ error: 'roleId(s) required for delete.' });
  }
  const results = [];
  for (const rid of roleIds) {
    const role = discord.roles?.cache?.get(rid) || discord.guilds.cache.map(g => g.roles.cache.get(rid)).find(Boolean);
    if (!role) {
      results.push({ error: 'Role not found', id: rid });
      continue;
    }
    await role.delete();
    log.debug(`[${toolName}] Role deleted`, { id: rid });
    results.push({ deleted: true, id: rid });
  }
  return buildResponse({ results });
}
