import { z, buildResponse } from '@purinton/mcp-server';

// Tool: delete-invite
// Deletes an invite link from a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Revoke an invite link from a guild.',
    {
      guildId: z.string(),
      code: z.string(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, code, reason } = _args;
      const guild = await discord.helpers.getGuild(guildId);
      const invite = guild.invites.cache.get(code);
      if (!invite) throw new Error('Invite not found');
      try {
        await invite.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete invite: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { code });
      return buildResponse({ success: true, code });
    }
  );
}
