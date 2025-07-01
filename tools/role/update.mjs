import { PermissionsBitField } from 'discord.js';
export default async function ({ roleId, roleSettings, log, discord, buildResponse, toolName }) {
  const roleIds = Array.isArray(roleId) ? roleId.filter(Boolean) : roleId ? [roleId].filter(Boolean) : [];
  let settingsArr = Array.isArray(roleSettings) ? roleSettings : roleSettings ? [roleSettings] : [];
  if (!roleIds.length || !settingsArr.length) {
    log.error(`[${toolName}] roleId(s) and roleSettings required for update.`);
    return buildResponse({ error: 'roleId(s) and roleSettings required for update.' });
  }
  const results = [];
  for (let i = 0; i < roleIds.length; i++) {
    const rid = roleIds[i];
    const settings = settingsArr[i] || settingsArr[0];
    const role = discord.roles?.cache?.get(rid) || discord.guilds.cache.map(g => g.roles.cache.get(rid)).find(Boolean);
    if (!role) {
      results.push({ error: 'Role not found', id: rid });
      continue;
    }
    const opts = Object.fromEntries(
      Object.entries(settings).filter(([_, v]) => v !== undefined && v !== null)
    );
    if (Array.isArray(opts.permissions)) {
      const permsArr = opts.permissions
        .map(p => (typeof p === 'string' && PermissionsBitField.Flags[p]) ? PermissionsBitField.Flags[p] : null)
        .filter(Boolean);
      opts.permissions = permsArr.length > 0 ? PermissionsBitField.resolve(permsArr) : undefined;
      if (opts.permissions === undefined) delete opts.permissions;
    } else {
      delete opts.permissions;
    }
    await role.edit(opts);
    log.debug(`[${toolName}] Role updated`, { id: role.id });
    results.push({ updated: true, id: role.id });
  }
  return buildResponse({ results });
}
