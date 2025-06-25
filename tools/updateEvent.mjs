import { z, buildResponse } from '@purinton/mcp-server';

// Tool: update-event
// Updates a scheduled event in a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Update a scheduled event in a guild.',
    {
      guildId: z.string(),
      eventId: z.string(),
      channelId: z.string().optional(),
      description: z.string().optional(),
      entityType: z.number().optional(),
      name: z.string().optional(),
      privacyLevel: z.number().optional(),
      reason: z.string().optional(),
      scheduledEndTime: z.string().optional(),
      scheduledStartTime: z.string().optional(),
      status: z.number().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, eventId, ...updateFields } = _args;
      let event;
      try {
        event = await discord.guilds.cache.get(guildId).scheduledEvents.fetch(eventId);
        await event.edit(updateFields);
      } catch (err) {
        throw new Error('Failed to update event: ' + (err.message || err));
      }
      const response = { success: true, eventId };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
