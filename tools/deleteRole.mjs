import { z } from 'zod';
import { getGuild, getRole, buildResponse } from '../toolHelpers.mjs';

// Tool: delete-role
// Deletes a role from a guild.
export default async function (server, toolName = 'discord-delete-role') {
  server.tool(
    toolName,
    'Remove a role from the guild.',
    {
      guildId: z.string(),
      roleId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, roleId, reason } = args;
      const guild = getGuild(guildId);
      const role = await getRole(guild, roleId);
      try {
        await role.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete role: ' + (err.message || err));
      }
      return buildResponse({ success: true, deletedRoleId: roleId });
    }
  );
}
