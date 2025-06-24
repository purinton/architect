import { z } from 'zod';
import { getGuild, cleanOptions, buildResponse } from '../toolHelpers.mjs';

// Tool: create-event
// Creates a scheduled event in a guild.
export default async function (server, toolName = 'discord-create-event') {
  server.tool(
    toolName,
    'Create a scheduled event in a guild.',
    {
      guildId: z.string(),
      name: z.string(),
      scheduledStartTime: z.string(), // ISO8601
      scheduledEndTime: z.string().optional(), // ISO8601
      description: z.string().optional(),
      entityType: z.number(), // 1: Stage, 2: Voice, 3: External
      channelId: z.string().optional(),
      privacyLevel: z.number().optional(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, ...eventData } = args;
      const guild = getGuild(guildId);
      let event;
      try {
        event = await guild.scheduledEvents.create(cleanOptions(eventData));
      } catch (err) {
        throw new Error('Failed to create event: ' + (err.message || err));
      }
      return buildResponse({ success: true, eventId: event.id });
    }
  );
}
