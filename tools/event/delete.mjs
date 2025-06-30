export default async function ({ guildId, eventId, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) return buildResponse({ error: 'Guild not found.' });
  if (!eventId) return buildResponse({ error: 'eventId required for delete.' });
  const event = guild.scheduledEvents.cache.get(eventId);
  if (!event) return buildResponse({ error: 'Event not found.' });
  await event.delete();
  return buildResponse({ deleted: true, id: eventId });
}
