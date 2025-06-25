import { z, buildResponse } from '@purinton/mcp-server';

// Tool: list-events
// Lists all scheduled events in a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'List all scheduled events in a guild.',
    {
      guildId: z.string(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId } = _args;
      let events;
      try {
        events = await discord.helpers.guilds.fetch(guildId).then(guild => guild.scheduledEvents.fetch());
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
      log.debug(`${toolName} Response`, { response: eventList });
      return buildResponse(eventList);
    }
  );
}
