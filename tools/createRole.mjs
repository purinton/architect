import { z, buildResponse } from '@purinton/mcp-server';

// Tool: create-role
// Creates a new role in a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
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
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, ...roleData } = _args;
      const guild = await discord.helpers.getGuild(discord, guildId);
      if (Array.isArray(roleData.permissions)) {
        roleData.permissions = roleData.permissions.map(discord.helpers.toPascalCasePerms);
      }
      const options = discord.helpers.cleanOptions(roleData);
      let role;
      try {
        role = await guild.roles.create(options);
      } catch (err) {
        throw new Error('Failed to create role: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { roleId: role.id, name: role.name });
      return buildResponse({ success: true, roleId: role.id, name: role.name });
    }
  );
}
