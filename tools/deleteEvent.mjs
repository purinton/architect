import { z, buildResponse } from '@purinton/mcp-server';

// Tool: delete-event
// Deletes a scheduled event in a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Delete a scheduled event in a guild.',
    {
      guildId: z.string(),
      eventId: z.string(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, eventId, reason } = _args;
      const guild = await discord.helpers.getGuild(guildId);
      const event = guild.scheduledEvents.cache.get(eventId);
      if (!event) throw new Error('Event not found');
      try {
        await event.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete event: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { eventId });
      return buildResponse({ success: true, eventId });
    }
  );
}
