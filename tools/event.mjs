import { z, buildResponse } from '@purinton/mcp-server';

const eventSettingsSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  scheduledStartTime: z.string().optional(), // ISO string
  scheduledEndTime: z.string().optional(),
  privacyLevel: z.number().optional(),
  entityType: z.number().optional(),
  channelId: z.string().optional(),
  reason: z.string().optional(),
});

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create, update, delete, or list guild events.',
    {
      guildId: z.string(),
      method: z.enum(['create', 'update', 'delete', 'list']),
      eventId: z.string().optional(),
      eventSettings: eventSettingsSchema.nullable().optional(),
    },
    async (_args, _extra) => {
      log.debug(`[${toolName}] Request`, { _args });
      const { guildId, method, eventId, eventSettings } = _args;
      const guild = discord.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      if (method === 'create') {
        if (!eventSettings?.name || !eventSettings?.scheduledStartTime || !eventSettings?.entityType) throw new Error('name, scheduledStartTime, and entityType required for create.');
        const event = await guild.scheduledEvents.create(eventSettings);
        return buildResponse({ created: true, id: event.id, name: event.name });
      } else if (method === 'update') {
        if (!eventId || !eventSettings) throw new Error('eventId and eventSettings required for update.');
        const event = guild.scheduledEvents.cache.get(eventId);
        if (!event) throw new Error('Event not found.');
        await event.edit(eventSettings);
        return buildResponse({ updated: true, id: event.id });
      } else if (method === 'delete') {
        if (!eventId) throw new Error('eventId required for delete.');
        const event = guild.scheduledEvents.cache.get(eventId);
        if (!event) throw new Error('Event not found.');
        await event.delete();
        return buildResponse({ deleted: true, id: eventId });
      } else if (method === 'list') {
        const events = guild.scheduledEvents.cache.map(e => ({ id: e.id, name: e.name, scheduledStartTime: e.scheduledStartTime }));
        return buildResponse({ events });
      } else {
        throw new Error('Invalid method.');
      }
    }
  );
}
