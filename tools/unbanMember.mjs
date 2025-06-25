import { z, buildResponse } from '@purinton/mcp-server';

// Tool: unban-member
// Unbans a user from a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Remove ban from a user.',
    {
      guildId: z.string(),
      userId: z.string(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, userId, reason } = _args;
      try {
        await discord.helpers.guilds.unban(guildId, userId, reason);
      } catch (err) {
        throw new Error('Failed to unban user: ' + (err.message || err));
      }
      const response = { success: true, userId };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
