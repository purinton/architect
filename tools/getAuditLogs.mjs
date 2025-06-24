import { z } from 'zod';
import { getGuild, fetchAuditLogEntries, buildResponse } from '../toolHelpers.mjs';

// Tool: get-audit-logs
// Retrieves audit log entries for a guild, filterable by action, user, or time.
export default async function (server, toolName = 'discord-get-audit-logs') {
  server.tool(
    toolName,
    'Retrieve audit log entries filtered by action, user, or time.',
    {
      guildId: z.string(),
      actionType: z.number().optional(), // Discord AuditLogEvent type
      userId: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
      before: z.string().optional(), // Entry ID to fetch logs before
    },
    async (args, extra) => {
      const { guildId, actionType, userId, limit = 50, before } = args;
      const guild = getGuild(guildId);
      let entries;
      try {
        entries = await fetchAuditLogEntries(guild, { actionType, userId, limit, before });
      } catch (err) {
        throw new Error('Failed to fetch audit logs: ' + (err.message || err));
      }
      return buildResponse(entries);
    }
  );
}
