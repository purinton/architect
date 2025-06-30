export default async function ({ guildId, eventId, eventSettings, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) return buildResponse({ error: 'Guild not found.' });
  if (!eventId || !eventSettings) return buildResponse({ error: 'eventId and eventSettings required for update.' });
  const event = guild.scheduledEvents.cache.get(eventId);
  if (!event) return buildResponse({ error: 'Event not found.' });

  let updatePayload = { ...eventSettings };

  // If channelId is provided, resolve to channel object and use 'channel' property
  if (eventSettings?.channelId) {
    const channel = guild.channels.cache.get(eventSettings.channelId);
    if (!channel) return buildResponse({ error: 'Channel not found.' });
    if (!channel.isVoiceBased()) {
      return buildResponse({ error: 'Event update requires a voice or stage channel.' });
    }
    updatePayload.channel = channel;
    delete updatePayload.channelId;
  }

  // If channel is provided directly (should be a channel object or resolvable)
  if (eventSettings?.channel && !eventSettings.channelId) {
    const channel = guild.channels.cache.get(eventSettings.channel.id || eventSettings.channel);
    if (!channel) return buildResponse({ error: 'Channel not found.' });
    if (!channel.isVoiceBased()) {
      return buildResponse({ error: 'Event update requires a voice or stage channel.' });
    }
    updatePayload.channel = channel;
  }

  // Remove any extraneous keys
  delete updatePayload.channelId;

  await event.edit(updatePayload);
  return buildResponse({ updated: true, id: event.id });
}
