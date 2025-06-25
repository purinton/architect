import { z, buildResponse } from '@purinton/mcp-server';

// Tool: timeout-member
// Timeouts (mutes) a member in a guild for a specified duration.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Timeout (mute) a member for a specified duration and optional reason.',
    {
      guildId: z.string(),
      memberId: z.string(),
      durationMs: z.number(), // Duration in milliseconds
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, memberId, durationMs, reason } = _args;
      const guild = await discord.guilds.fetch(guildId);
      const member = await guild.members.fetch(memberId);
      try {
        await member.timeout(durationMs, reason);
      } catch (err) {
        throw new Error('Failed to timeout member: ' + (err.message || err));
      }
      return buildResponse({ success: true, memberId, durationMs });
    }
  );
}
