import { z } from 'zod';
import { getGuild, getRole, cleanOptions, toPascalCasePerms, buildResponse } from '../toolHelpers.mjs';

// Tool: update-role
// Updates properties of a role in a guild, with improved error handling and summary return.
export default async function (server, toolName = 'discord-update-role') {
  server.tool(
    toolName,
    'Change role name, permissions, color, hoist status, and more. Returns updated role summary.',
    {
      guildId: z.string(),
      roleId: z.string(),
      name: z.string().optional(),
      color: z.number().optional(),
      hoist: z.boolean().optional(),
      mentionable: z.boolean().optional(),
      permissions: z.array(z.string()).optional(),
      position: z.number().optional(),
    },
    async (args, extra) => {
      const { guildId, roleId, ...updateFields } = args;
      const guild = getGuild(guildId);
      const role = await getRole(guild, roleId);
      if (Array.isArray(updateFields.permissions)) {
        updateFields.permissions = updateFields.permissions.map(toPascalCasePerms);
      }
      const cleaned = cleanOptions(updateFields);
      let updatedRole;
      try {
        updatedRole = await role.edit(cleaned);
      } catch (err) {
        throw new Error('Failed to update role: ' + (err.message || err));
      }
      const summary = {
        id: updatedRole.id,
        name: updatedRole.name,
        color: updatedRole.color,
        hoist: updatedRole.hoist,
        mentionable: updatedRole.mentionable,
        permissions: updatedRole.permissions?.toArray?.() || [],
        position: updatedRole.position,
      };
      return buildResponse({ success: true, updated: summary });
    }
  );
}
