import { z, buildResponse } from '@purinton/mcp-server';

// Tool: update-member-nickname
// Updates a member's nickname in a guild, with improved error handling and returns updated info.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    "Change a member's nickname in a guild. Returns updated member info.",
    {
      guildId: z.string(),
      memberId: z.string(),
      nickname: z.string().nullable(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, memberId, nickname, reason } = _args;
      const guild = await discord.helpers.guilds.fetch(guildId);
      const member = await guild.members.fetch(memberId);
      try {
        await member.setNickname(nickname, reason);
      } catch (err) {
        throw new Error('Failed to update nickname: ' + (err.message || err));
      }
      const response = { success: true, memberId, nickname: member.nickname, displayName: member.displayName };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
