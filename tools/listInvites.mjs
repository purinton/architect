import { z } from 'zod';
import { getGuild, buildResponse } from '../toolHelpers.mjs';

// Tool: list-invites
// Lists all invites in a guild.
export default async function (server, toolName = 'discord-list-invites') {
  server.tool(
    toolName,
    'List all active invite links in a guild.',
    {
      guildId: z.string(),
    },
    async (args, extra) => {
      const { guildId } = args;
      const guild = getGuild(guildId);
      let invites;
      try {
        invites = await guild.invites.fetch();
      } catch (err) {
        throw new Error('Failed to fetch invites: ' + (err.message || err));
      }
      const inviteList = Array.from(invites.values()).map(invite => ({
        code: invite.code,
        channelId: invite.channel?.id,
        inviter: invite.inviter ? `${invite.inviter.username}#${invite.inviter.discriminator}` : undefined,
        uses: invite.uses,
        maxUses: invite.maxUses,
        expiresAt: invite.expiresAt,
        url: invite.url,
      }));
      return buildResponse(inviteList);
    }
  );
}
