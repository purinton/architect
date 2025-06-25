import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Returns a concise list of roles in a guild, with only the most crucial high-level information.',
    { guildId: z.string() },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const args = _args;
      const guildId = args.guildId;
      const guild = discord.helpers.guilds.cache.get(guildId);
      const roles = guild.roles.cache
        .sort((a, b) => b.position - a.position)
        .map(role => {
          let managedUser = null;
          if (role.managed) {
            managedUser = guild.members.cache.find(m => m.user && m.user.bot && m.roles.cache.has(role.id));
          }
          return {
            id: role.id,
            name: role.name,
            color: role.color,
            position: role.position,
            hoist: role.hoist,
            managed: role.managed,
            mentionable: role.mentionable,
            permissions: role.permissions?.toArray?.() || [],
            memberCount: guild.members.cache.filter(m => m.roles.cache.has(role.id)).size,
            managedUser: role.managed && managedUser ? {
              id: managedUser.user.id,
              username: managedUser.user.username,
              discriminator: managedUser.user.discriminator,
              bot: managedUser.user.bot
            } : undefined
          };
        });
      log.debug(`${toolName} Response`, { response: roles });
      return buildResponse(roles);
    }
  );
}
