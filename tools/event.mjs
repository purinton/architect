import { z, buildResponse } from '@purinton/mcp-server';

const eventSettingsSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  scheduledStartTime: z.string().describe('ISO string'),
  scheduledEndTime: z.string().describe('ISO string'),
  privacyLevel: z.number().describe('Privacy level for the event (0 = Guild Only, 1 = Public, 2 = Private)'),
  entityType: z.number().describe('1 = Stage Instance (requires a stage channel), 2 = Voice (requires a voice channel), 3 = External (no channel required)'),
  channelId: z.string().describe('Channel ID for the event (required for stage/voice events)'),
  reason: z.string().describe('Reason for the event creation'),
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
        // Voice/stage channel check
        if (eventSettings?.channelId) {
          const channel = guild.channels.cache.get(eventSettings.channelId);
          if (!channel) throw new Error('Channel not found.');
          // Discord voice: 2, stage: 13
          if (![2, 13].includes(channel.type)) {
            throw new Error('Event creation requires a voice or stage channel.');
          }
        }
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
