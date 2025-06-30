export default async function ({ guildId, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) return buildResponse({ error: 'Guild not found.' });
  const events = guild.scheduledEvents.cache.map(e => ({ id: e.id, name: e.name, scheduledStartTime: e.scheduledStartTime }));
  return buildResponse({ events });
}
