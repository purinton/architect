import { z } from 'zod';
import { getGuild, getMember, ensureArrayOfIds, buildResponse } from '../toolHelpers.mjs';

// Tool: update-member-roles
// Sets or updates all roles for a member in a guild, validates role IDs, returns updated roles.
export default async function (server, toolName = 'discord-update-member-roles') {
  server.tool(
    toolName,
    'Set or update all roles for a member in a guild. Validates role IDs and returns updated roles.',
    {
      guildId: z.string(),
      memberId: z.string(),
      roleIds: z.array(z.string()),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, roleIds, reason } = args;
      const guild = getGuild(guildId);
      const member = await getMember(guild, memberId);
      const validRoleIds = ensureArrayOfIds(guild, roleIds, 'role');
      try {
        await member.roles.set(validRoleIds, reason);
      } catch (err) {
        throw new Error('Failed to update member roles: ' + (err.message || err));
      }
      return buildResponse({ success: true, memberId, roles: member.roles.cache.map(r => r.id) });
    }
  );
}
