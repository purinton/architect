export default async function ({ channelId, messageId, messageSettings, log, discord, buildResponse, toolName }) {
  const channel = discord.channels.cache.get(channelId);
  if (!channel || !channel.messages) return buildResponse({ error: 'Channel not found or cannot edit.' });
  if (!messageId) return buildResponse({ error: 'messageId required for edit.' });
  if (!messageSettings) return buildResponse({ error: 'messageSettings required for edit.' });
  const msg = await channel.messages.fetch(messageId);
  if (!msg) return buildResponse({ error: 'Message not found.' });
  const edited = await msg.edit(messageSettings);
  return buildResponse({ edited: true, messageId, content: edited.content });
}
