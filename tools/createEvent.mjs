import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
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
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, ...eventData } = _args;
      const guild = await discord.getGuild(guildId);
      let event;
      try {
        event = await guild.scheduledEvents.create(discord.cleanOptions(eventData));
      } catch (err) {
        throw new Error('Failed to create event: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { eventId: event.id });
      return buildResponse({ success: true, eventId: event.id });
    }
  );
}
