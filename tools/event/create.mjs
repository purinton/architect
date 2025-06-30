export default async function ({ guildId, eventSettings, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) return buildResponse({ error: 'Guild not found.' });
  if (!eventSettings?.name || !eventSettings?.scheduledStartTime || !eventSettings?.entityType) return buildResponse({ error: 'name, scheduledStartTime, and entityType required for create.' });
  let eventPayload = { ...eventSettings, privacyLevel: 2 };
  if (eventSettings?.channelId) {
    const channel = guild.channels.cache.get(eventSettings.channelId);
    if (!channel) return buildResponse({ error: 'Channel not found.' });
    if (!channel.isVoiceBased()) {
      return buildResponse({ error: 'Event creation requires a voice or stage channel.' });
    }
    eventPayload.channel = channel;
    delete eventPayload.channelId;
  }
  // If channel is provided directly (should be a channel object or resolvable)
  if (eventSettings?.channel && !eventSettings.channelId) {
    const channel = guild.channels.cache.get(eventSettings.channel.id || eventSettings.channel);
    if (!channel) return buildResponse({ error: 'Channel not found.' });
    if (!channel.isVoiceBased()) {
      return buildResponse({ error: 'Event creation requires a voice or stage channel.' });
    }
    eventPayload.channel = channel;
  }
  // For external events, set entityMetadata
  if (eventSettings.entityType === 3) {
    const location = eventSettings.location || 'Not Specified';
    eventPayload = {
      ...eventPayload,
      entityMetadata: { location },
    };
  }
  delete eventPayload.channelId;
  const event = await guild.scheduledEvents.create(eventPayload);
  return buildResponse({ created: true, id: event.id, name: event.name });
}
