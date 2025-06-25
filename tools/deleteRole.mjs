import { z, buildResponse } from '@purinton/mcp-server';

// Tool: delete-role
// Deletes a role from a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Remove a role from the guild.',
    {
      guildId: z.string(),
      roleId: z.string(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, roleId, reason } = _args;
      const guild = await discord.getGuild(guildId);
      const role = await discord.getRole(guild, roleId);
      if (!role) throw new Error('Role not found');
      try {
        await role.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete role: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { roleId });
      return buildResponse({ success: true, roleId });
    }
  );
}
