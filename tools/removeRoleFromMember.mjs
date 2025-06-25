import { z, buildResponse } from '@purinton/mcp-server';

// Tool: remove-role-from-member
// Removes a role from a member in a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Remove a role from a guild member.',
    {
      guildId: z.string(),
      memberId: z.string(),
      roleId: z.string(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, memberId, roleId } = _args;
      let response;
      try {
        const guild = await discord.guilds.fetch(guildId);
        const member = await guild.members.fetch(memberId);
        const role = await guild.roles.fetch(roleId);
        await member.roles.remove(role);
        response = { success: true, memberId, roleId };
      } catch (err) {
        throw new Error('Failed to remove role: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
