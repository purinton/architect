import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Returns all available details about a given role, including all properties, permissions (bitfield and names), and a detailed list of members with that role.',
    { guildId: z.string(), roleId: z.string() },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const args = _args;
      const guildId = args.guildId;
      const roleId = args.roleId;
      const guild = await discord.helpers.guilds.fetch(guildId);
      const role = await discord.helpers.roles.fetch(roleId);
      const permissions = role.permissions?.toArray?.() || [];
      const permissionsBitfield = role.permissions?.bitfield || null;
      const members = await guild.members.fetch();
      const filteredMembers = members.filter(m => m.roles.cache.has(roleId))
        .map(member => ({
          id: member.id,
          tag: member.user?.tag,
          username: member.user?.username,
          discriminator: member.user?.discriminator,
          avatar: member.user?.displayAvatarURL?.({ dynamic: true, size: 1024 }),
          joinedAt: member.joinedAt,
          displayName: member.displayName || member.nickname || member.user?.username,
          bot: member.user?.bot,
          user: member.user ? {
            id: member.user.id,
            username: member.user.username,
            discriminator: member.user.discriminator,
            tag: member.user.tag,
            avatar: member.user.displayAvatarURL?.({ dynamic: true, size: 1024 }),
            bot: member.user.bot
          } : undefined,
          nickname: member.nickname,
          roles: member.roles.cache.map(r => r.id),
          pending: member.pending,
          premiumSince: member.premiumSince,
          communicationDisabledUntil: member.communicationDisabledUntil,
        }));
      const response = {
        id: role.id,
        name: role.name,
        color: role.color,
        position: role.position,
        hoist: role.hoist,
        managed: role.managed,
        mentionable: role.mentionable,
        permissions,
        permissionsBitfield,
        memberCount: filteredMembers.length,
        members: filteredMembers,
      };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
