import { z, buildResponse } from '@purinton/mcp-server';

// Tool: update-role
// Updates properties of a role in a guild, with improved error handling and summary return.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
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
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, roleId, ...updateFields } = _args;
      const guild = await discord.helpers.getGuild(guildId);
      const role = await discord.helpers.getRole(guild, roleId);
      if (Array.isArray(updateFields.permissions)) {
        updateFields.permissions = updateFields.permissions.map(discord.helpers.toPascalCasePerms);
      }
      const cleaned = discord.helpers.cleanOptions(updateFields);
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
      log.debug(`${toolName} Response`, { response: { success: true, updated: summary } });
      return buildResponse({ success: true, updated: summary });
    }
  );
}
