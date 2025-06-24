import { z } from 'zod';
import { getGuild, buildResponse } from '../toolHelpers.mjs';

// Tool: delete-event
// Deletes a scheduled event in a guild.
export default async function (server, toolName = 'discord-delete-event') {
  server.tool(
    toolName,
    'Delete a scheduled event in a guild.',
    {
      guildId: z.string(),
      eventId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, eventId, reason } = args;
      const guild = getGuild(guildId);
      let event;
      try {
        event = await guild.scheduledEvents.fetch(eventId);
        await event.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete event: ' + (err.message || err));
      }
      return buildResponse({ success: true, eventId });
    }
  );
}
