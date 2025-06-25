import { z, buildResponse } from '@purinton/mcp-server';

// Tool: kick-member
// Kicks a member from a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Kick a member from the guild.',
    {
      guildId: z.string(),
      memberId: z.string(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, memberId, reason } = _args;
      const guild = await discord.helpers.guilds.fetch(guildId);
      const member = await guild.members.fetch(memberId);
      try {
        await member.kick(reason);
      } catch (err) {
        throw new Error('Failed to kick member: ' + (err.message || err));
      }
      const response = { success: true, memberId };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
