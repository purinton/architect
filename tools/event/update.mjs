export default async function ({ guildId, eventId, eventSettings, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) return buildResponse({ error: 'Guild not found.' });
  if (!eventId || !eventSettings) return buildResponse({ error: 'eventId and eventSettings required for update.' });
  const event = guild.scheduledEvents.cache.get(eventId);
  if (!event) return buildResponse({ error: 'Event not found.' });
  await event.edit(eventSettings);
  return buildResponse({ updated: true, id: event.id });
}
