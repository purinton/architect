import { z, buildResponse } from '@purinton/mcp-server';

// Tool: update-member-roles
// Sets or updates all roles for a member in a guild, validates role IDs, returns updated roles.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Set or update all roles for a member in a guild. Validates role IDs and returns updated roles.',
    {
      guildId: z.string(),
      memberId: z.string(),
      roleIds: z.array(z.string()),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, memberId, roleIds, reason } = _args;
      const guild = await discord.guilds.fetch(guildId);
      const member = await guild.members.fetch(memberId);
      const validRoleIds = roleIds.filter(roleId => guild.roles.cache.has(roleId));
      try {
        await member.roles.set(validRoleIds, reason);
      } catch (err) {
        throw new Error('Failed to update member roles: ' + (err.message || err));
      }
      const response = { success: true, memberId, roles: member.roles.cache.map(r => r.id) };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
