import { z } from 'zod';
import { getGuild, cleanOptions, toPascalCasePerms, buildResponse } from '../toolHelpers.mjs';

// Tool: create-role
// Creates a new role in a guild.
export default async function (server, toolName = 'discord-create-role') {
  server.tool(
    toolName,
    'Create a new role with specified permissions and color.',
    {
      guildId: z.string(),
      name: z.string(),
      color: z.number().optional(),
      hoist: z.boolean().optional(),
      mentionable: z.boolean().optional(),
      permissions: z.array(z.string()).optional(),
      position: z.number().optional(),
    },
    async (args, extra) => {
      const { guildId, ...roleData } = args;
      const guild = getGuild(guildId);
      if (Array.isArray(roleData.permissions)) {
        roleData.permissions = roleData.permissions.map(toPascalCasePerms);
      }
      const options = cleanOptions(roleData);
      let role;
      try {
        role = await guild.roles.create(options);
      } catch (err) {
        throw new Error('Failed to create role: ' + (err.message || err));
      }
      return buildResponse({ success: true, roleId: role.id, name: role.name });
    }
  );
}
