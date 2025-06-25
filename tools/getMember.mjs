import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Returns all available details about a given member, including all properties, roles, presence, and user info.',
    { guildId: z.string(), memberId: z.string() },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, memberId } = _args;
      const guild = await discord.helpers.guilds.fetch(guildId);
      const member = await guild.members.fetch(memberId);
      const user = member.user;
      const presence = member.presence ? {
        status: member.presence.status,
        activities: member.presence.activities?.map(a => ({
          name: a.name,
          type: a.type,
          state: a.state,
          details: a.details,
          url: a.url,
        }))
      } : undefined;
      const memberInfo = {
        id: member.id,
        displayName: member.displayName || member.nickname || user?.username,
        nickname: member.nickname,
        joinedAt: member.joinedAt,
        premiumSince: member.premiumSince,
        pending: member.pending,
        communicationDisabledUntil: member.communicationDisabledUntil,
        roles: member.roles.cache.map(r => ({
          id: r.id,
          name: r.name,
          color: r.color,
          position: r.position,
        })),
        user: user ? {
          id: user.id,
          username: user.username,
          discriminator: user.discriminator,
          tag: user.tag,
          avatar: user.displayAvatarURL?.({ dynamic: true, size: 1024 }),
          bot: user.bot
        } : undefined,
        presence,
      };
      log.debug(`${toolName} Response`, { response: memberInfo });
      return buildResponse(memberInfo);
    }
  );
}
