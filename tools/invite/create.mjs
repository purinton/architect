export default async function ({ channelId, inviteSettings, log, discord, buildResponse, toolName }) {
  const channel = discord.channels.cache.get(channelId);
  if (!channel || !channel.createInvite) return buildResponse({ error: 'Channel not found or cannot create invites.' });
  const invite = await channel.createInvite(inviteSettings || {});
  return buildResponse({ created: true, code: invite.code, url: invite.url });
}
