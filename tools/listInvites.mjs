import { z, buildResponse } from '@purinton/mcp-server';

// Tool: list-invites
// Lists all invites in a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'List all active invite links in a guild.',
    {
      guildId: z.string(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId } = _args;
      let invites;
      try {
        invites = await discord.helpers.guilds.cache.get(guildId).invites.fetch();
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
      log.debug(`${toolName} Response`, { response: inviteList });
      return buildResponse(inviteList);
    }
  );
}
