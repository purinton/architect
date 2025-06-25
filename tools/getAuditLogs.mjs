import { z, buildResponse } from '@purinton/mcp-server';

// Tool: get-audit-logs
// Retrieves audit log entries for a guild, filterable by action, user, or time.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Fetches audit log entries filtered by action, user, or time.',
    {
      guildId: z.string(),
      actionType: z.number().optional(), // Discord AuditLogEvent type
      before: z.string().optional(), // Entry ID to fetch logs before
      limit: z.number().optional(),
      userId: z.string().optional(),
    },
    async (_args, _extra) => {
      const { guildId, actionType, userId, limit = 50, before } = _args;
      log.debug(`${toolName} Request`, { _args });
      const guild = discord.helpers.getGuild(discord, guildId);
      let entries;
      try {
        entries = await discord.helpers.fetchAuditLogEntries(guild, { actionType, userId, limit, before });
      } catch (err) {
        throw new Error('Failed to fetch audit logs: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { response: entries });
      return buildResponse(entries);
    }
  );
}
