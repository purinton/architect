export default async function ({ guildId, eventSettings, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) return buildResponse({ error: 'Guild not found.' });
  if (!eventSettings?.name || !eventSettings?.scheduledStartTime || !eventSettings?.entityType) return buildResponse({ error: 'name, scheduledStartTime, and entityType required for create.' });
  if (eventSettings?.channelId) {
    const channel = guild.channels.cache.get(eventSettings.channelId);
    if (!channel) return buildResponse({ error: 'Channel not found.' });
    if (![2, 13].includes(channel.type)) {
      return buildResponse({ error: 'Event creation requires a voice or stage channel.' });
    }
  }
  let eventPayload = { ...eventSettings, privacyLevel: 2 };
  if (eventSettings.entityType === 3) {
    const location = eventSettings.location || 'Not Specified';
    eventPayload = {
      ...eventPayload,
      entityMetadata: { location },
    };
  }
  const event = await guild.scheduledEvents.create(eventPayload);
  return buildResponse({ created: true, id: event.id, name: event.name });
}
