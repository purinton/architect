export default async function ({ channelId, log, discord, buildResponse, toolName }) {
  if (!channelId) return buildResponse({ error: 'channelId required for get-permissions.' });
  const channel = discord.channels.cache.get(Array.isArray(channelId) ? channelId[0] : channelId);
  if (!channel || !channel.permissionOverwrites) return buildResponse({ error: 'Channel not found or does not support permissions.' });
  const perms = channel.permissionOverwrites.cache.map(po => {
    const guild = channel.guild;
    const name = po.type === 'role'
      ? guild.roles.cache.get(po.id)?.name ?? null
      : guild.members.cache.get(po.id)?.user?.username ?? null;
    const allow = po.allow?.toArray() || [];
    const deny = po.deny?.toArray() || [];
    return {
      id: po.id,
      name,
      type: po.type,
      allow,
      deny,
      inherited: po.inherited || false,
    };
  });
  return buildResponse({ permissionOverwrites: perms });
}
