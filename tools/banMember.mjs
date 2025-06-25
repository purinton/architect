import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Ban a member with optional reason and duration.',
    {
      guildId: z.string(),
      memberId: z.string(),
      reason: z.string().optional(),
      deleteMessageSeconds: z.number().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, memberId, reason, deleteMessageSeconds } = _args;
      const guild = await discord.getGuild(guildId);
      const member = await discord.getMember(guild, memberId);
      try {
        await member.ban({ reason, deleteMessageSeconds });
      } catch (err) {
        throw new Error('Failed to ban member: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { memberId });
      return buildResponse({ success: true, memberId });
    }
  );
}
