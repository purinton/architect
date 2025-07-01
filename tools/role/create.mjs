import { PermissionsBitField } from 'discord.js';
export default async function ({ guildId, roleSettings, log, discord, buildResponse, toolName }) {
  let settingsArr = Array.isArray(roleSettings) ? roleSettings : roleSettings ? [roleSettings] : [];
  settingsArr = settingsArr.filter(s => s && typeof s.name === 'string' && s.name.trim());
  log.debug(`[${toolName}] Final settingsArr for create`, { settingsArr });
  if (!guildId || !settingsArr.length) {
    log.error(`[${toolName}] guildId and valid roleSettings (with name) required for create.`);
    return buildResponse({ error: 'guildId and valid roleSettings (with name) required for create.' });
  }
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) {
    log.error(`[${toolName}] Guild not found.`, { guildId });
    return buildResponse({ error: 'Guild not found.' });
  }
  const results = [];
  for (const settings of settingsArr) {
    const opts = { ...settings };
    if (Array.isArray(opts.permissions)) {
      const permsArr = opts.permissions
        .map(p => (typeof p === 'string' && PermissionsBitField.Flags[p]) ? PermissionsBitField.Flags[p] : null)
        .filter(Boolean);
      opts.permissions = permsArr.length > 0 ? PermissionsBitField.resolve(permsArr) : undefined;
      if (opts.permissions === undefined) delete opts.permissions;
    } else {
      delete opts.permissions;
    }
    const created = await guild.roles.create(opts);
    log.debug(`[${toolName}] Role created`, { id: created.id });
    results.push({ created: true, id: created.id, name: created.name });
  }
  return buildResponse({ results });
}
