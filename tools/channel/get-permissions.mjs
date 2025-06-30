export default async function ({ channelId, log, discord, buildResponse, toolName }) {
  if (!channelId) return buildResponse({ error: 'channelId required for get-permissions.' });
  const channel = discord.channels.cache.get(Array.isArray(channelId) ? channelId[0] : channelId);
  if (!channel || !channel.permissionOverwrites) return buildResponse({ error: 'Channel not found or does not support permissions.' });
  const perms = channel.permissionOverwrites.cache.map(po => {
    const guild = channel.guild;
    let name = null;
    if (po.type === 'role' || po.type === 0) {
      if (po.id === guild.id) {
        name = '@everyone';
      } else {
        name = guild.roles.cache.get(po.id)?.name || `Role ${po.id}`;
      }
    } else if (po.type === 'member' || po.type === 1) {
      name = guild.members.cache.get(po.id)?.user?.username || `User ${po.id}`;
    }
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
