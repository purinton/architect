import { z } from 'zod';
import { getGuild, buildResponse } from '../toolHelpers.mjs';

// Tool: update-event
// Updates a scheduled event in a guild.
export default async function (server, toolName = 'discord-update-event') {
  server.tool(
    toolName,
    'Update a scheduled event in a guild.',
    {
      guildId: z.string(),
      eventId: z.string(),
      name: z.string().optional(),
      scheduledStartTime: z.string().optional(),
      scheduledEndTime: z.string().optional(),
      description: z.string().optional(),
      entityType: z.number().optional(),
      channelId: z.string().optional(),
      privacyLevel: z.number().optional(),
      status: z.number().optional(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, eventId, ...updateFields } = args;
      const guild = getGuild(guildId);
      let event;
      try {
        event = await guild.scheduledEvents.fetch(eventId);
        await event.edit(updateFields);
      } catch (err) {
        throw new Error('Failed to update event: ' + (err.message || err));
      }
      return buildResponse({ success: true, eventId });
    }
  );
}
