import { z } from 'zod';
import { getGuild, getRole, buildResponse } from '../toolHelpers.mjs';

export default async function (server, toolName = 'discord-get-role') {
  server.tool(
    toolName,
    'Returns all available details about a given role, including all properties, permissions (bitfield and names), and a detailed list of members with that role.',
    { guildId: z.string(), roleId: z.string() },
    async (args, extra) => {
      const guildId = args.guildId;
      const roleId = args.roleId;
      const guild = getGuild(guildId);
      const role = await getRole(guild, roleId);
      const permissions = role.permissions?.toArray?.() || [];
      const permissionsBitfield = role.permissions?.bitfield || null;
      const members = guild.members.cache
        .filter(m => m.roles.cache.has(roleId))
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
      let managedUser = null;
      if (role.managed) {
        managedUser = guild.members.cache.find(m => m.user && m.user.bot && m.roles.cache.has(role.id));
      }
      const roleInfo = {
        id: role.id,
        name: role.name,
        color: role.color,
        hexColor: role.hexColor,
        position: role.position,
        rawPosition: role.rawPosition,
        hoist: role.hoist,
        managed: role.managed,
        mentionable: role.mentionable,
        permissions,
        permissionsBitfield,
        createdAt: role.createdAt,
        createdTimestamp: role.createdTimestamp,
        deleted: role.deleted,
        icon: role.icon,
        unicodeEmoji: role.unicodeEmoji,
        tags: role.tags,
        memberCount: members.length,
        members,
        managedUser: role.managed && managedUser ? {
          id: managedUser.user.id,
          username: managedUser.user.username,
          discriminator: managedUser.user.discriminator,
          bot: managedUser.user.bot
        } : undefined,
      };
      function replacer(key, value) {
        return typeof value === 'bigint' ? value.toString() : value;
      }
      return buildResponse(roleInfo, replacer);
    }
  );
}
