import { z } from 'zod';
import { getGuild, getMember, getRole, buildResponse } from '../toolHelpers.mjs';

// Tool: remove-role-from-member
// Removes a role from a member in a guild.
export default async function (server, toolName = 'discord-remove-role-from-member') {
  server.tool(
    toolName,
    'Remove a role from a guild member.',
    {
      guildId: z.string(),
      memberId: z.string(),
      roleId: z.string(),
    },
    async (args, extra) => {
      const { guildId, memberId, roleId } = args;
      const guild = getGuild(guildId);
      const member = await getMember(guild, memberId);
      const role = await getRole(guild, roleId);
      try {
        await member.roles.remove(role);
      } catch (err) {
        throw new Error('Failed to remove role: ' + (err.message || err));
      }
      return buildResponse({ success: true, memberId, roleId });
    }
  );
}
