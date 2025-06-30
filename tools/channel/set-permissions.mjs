import { PermissionsBitField } from 'discord.js';
export default async function ({ channelId, permissionOverwrites, log, discord, buildResponse, toolName }) {
  if (!channelId) return buildResponse({ error: 'channelId required for set-permissions.' });
  if (!permissionOverwrites || !Array.isArray(permissionOverwrites)) return buildResponse({ error: 'permissionOverwrites array required for set-permissions.' });
  const channel = discord.channels.cache.get(Array.isArray(channelId) ? channelId[0] : channelId);
  if (!channel || !channel.permissionOverwrites) return buildResponse({ error: 'Channel not found or does not support permissions.' });
  const results = [];
  for (let po of permissionOverwrites) {
    try {
      let allow = Array.isArray(po.allow) ? PermissionsBitField.resolve(po.allow) : undefined;
      let deny = Array.isArray(po.deny) ? PermissionsBitField.resolve(po.deny) : undefined;
      // Ensure type is a string for Discord API
      let type = po.type;
      if (type === 0) type = 'role';
      if (type === 1) type = 'member';
      await channel.permissionOverwrites.edit(po.id, {
        allow,
        deny,
        type,
      });
      results.push({ id: po.id, type, updated: true });
    } catch (err) {
      results.push({ id: po.id, type: po.type, error: err?.message || String(err) });
    }
  }
  return buildResponse({ updated: true, count: permissionOverwrites.length, results });
}
