import { z, buildResponse } from '@purinton/mcp-server';

// Tool: assign-role-to-member
// Assigns a role to a member in a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Add a role to a guild member.',
    {
      guildId: z.string(),
      memberId: z.string(),
      roleId: z.string(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, memberId, roleId } = _args;
      const guild = await discord.helpers.getGuild(discord, guildId);
      const member = await discord.helpers.getMember(guild, memberId);
      const role = await discord.helpers.getRole(guild, roleId);
      try {
        await member.roles.add(role.id);
      } catch (err) {
        throw new Error('Failed to assign role: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { memberId, roleId });
      return buildResponse({ success: true, memberId, roleId });
    }
  );
}
