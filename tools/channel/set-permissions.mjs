import { PermissionsBitField } from 'discord.js';
export default async function ({ channelId, permissionOverwrites, log, discord, buildResponse, toolName }) {
  log.debug('[set-permissions] called', { channelId, permissionOverwrites });
  if (!channelId) {
    log.debug('[set-permissions] missing channelId');
    return buildResponse({ error: 'channelId required for set-permissions.' });
  }
  if (!permissionOverwrites || !Array.isArray(permissionOverwrites)) {
    log.debug('[set-permissions] missing or invalid permissionOverwrites');
    return buildResponse({ error: 'permissionOverwrites array required for set-permissions.' });
  }
  const channel = discord.channels.cache.get(Array.isArray(channelId) ? channelId[0] : channelId);
  log.debug('[set-permissions] got channel', { channel: !!channel });
  if (!channel || !channel.permissionOverwrites) {
    log.debug('[set-permissions] channel not found or no permissionOverwrites');
    return buildResponse({ error: 'Channel not found or does not support permissions.' });
  }
  const botUserId = discord.user?.id;
  log.debug('[set-permissions] botUserId', { botUserId });
  const results = [];
  for (let po of permissionOverwrites) {
    log.debug('[set-permissions] processing overwrite', { po });
    try {
      if (po.id === botUserId) {
        log.debug('[set-permissions] skipping bot user', { id: po.id });
        results.push({ id: po.id, type: po.type, skipped: true, reason: 'Cannot set permissions for the bot itself.' });
        continue;
      }
      let allow = Array.isArray(po.allow) && po.allow.length > 0 ? PermissionsBitField.resolve(po.allow) : undefined;
      log.debug('[set-permissions] resolved allow', { allow });
      let deny = Array.isArray(po.deny) && po.deny.length > 0 ? PermissionsBitField.resolve(po.deny) : undefined;
      log.debug('[set-permissions] resolved deny', { deny });
      // Ensure type is a string for Discord API
      let type = po.type;
      log.debug('[set-permissions] original type', { type });
      if (type === 0) type = 'role';
      if (type === 1) type = 'member';
      log.debug('[set-permissions] normalized type', { type });
      // Omit allow/deny if undefined
      const overwrite = { type };
      if (allow !== undefined) overwrite.allow = allow;
      if (deny !== undefined) overwrite.deny = deny;
      log.debug('[set-permissions] final overwrite', { id: po.id, overwrite });
      await channel.permissionOverwrites.edit(po.id, overwrite);
      log.debug('[set-permissions] overwrite applied', { id: po.id });
      results.push({ id: po.id, type, updated: true });
    } catch (err) {
      log.error('[set-permissions] error', { id: po.id, type: po.type, error: err, stack: err?.stack });
      results.push({ id: po.id, type: po.type, error: err?.message || String(err), stack: err?.stack });
    }
  }
  log.debug('[set-permissions] done', { results });
  return buildResponse({ updated: true, count: permissionOverwrites.length, results });
}
