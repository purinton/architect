import { z } from 'zod';
import { getGuild, buildResponse } from '../toolHelpers.mjs';

// Tool: list-events
// Lists all scheduled events in a guild.
export default async function (server, toolName = 'discord-list-events') {
  server.tool(
    toolName,
    'List all scheduled events in a guild.',
    {
      guildId: z.string(),
    },
    async (args, extra) => {
      const { guildId } = args;
      const guild = getGuild(guildId);
      let events;
      try {
        events = await guild.scheduledEvents.fetch();
      } catch (err) {
        throw new Error('Failed to fetch events: ' + (err.message || err));
      }
      const eventList = Array.from(events.values()).map(ev => ({
        id: ev.id,
        name: ev.name,
        description: ev.description,
        scheduledStartTime: ev.scheduledStartTimestamp,
        scheduledEndTime: ev.scheduledEndTimestamp,
        status: ev.status,
        entityType: ev.entityType,
        channelId: ev.channelId,
        creatorId: ev.creatorId,
        privacyLevel: ev.privacyLevel,
        userCount: ev.userCount,
      }));
      return buildResponse(eventList);
    }
  );
}
