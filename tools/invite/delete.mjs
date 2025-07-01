export default async function ({ inviteCode, log, discord, buildResponse, toolName }) {
  if (!inviteCode) return buildResponse({ error: 'inviteCode required for delete.' });
  const invite = await discord.fetchInvite(inviteCode);
  if (!invite) return buildResponse({ error: 'Invite not found.' });
  await invite.delete();
  return buildResponse({ deleted: true, code: inviteCode });
}
