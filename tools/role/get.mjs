export default async function ({ roleId, log, discord, buildResponse, toolName }) {
  const roleIds = Array.isArray(roleId) ? roleId.filter(Boolean) : roleId ? [roleId].filter(Boolean) : [];
  if (!roleIds.length) {
    log.error(`[${toolName}] roleId(s) required for get.`);
    return buildResponse({ error: 'roleId(s) required for get.' });
  }
  const results = roleIds.map(rid => {
    const role = discord.roles?.cache?.get(rid) || discord.guilds.cache.map(g => g.roles.cache.get(rid)).find(Boolean);
    if (!role) return { error: 'Role not found', id: rid };
    log.debug(`[${toolName}] Role found`, { id: role.id });
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions?.toArray ? role.permissions.toArray() : [],
      color: role.color,
      hoist: role.hoist,
      position: role.position,
      mentionable: role.mentionable,
    };
  });
  return buildResponse({ results });
}
