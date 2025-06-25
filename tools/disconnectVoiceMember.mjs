import { z, buildResponse } from '@purinton/mcp-server';

// Tool: disconnect-voice-member
// Disconnects a member from a voice channel.
export default async function ({ mcpServer, toolName = 'discord-disconnect-voice-member', log, discord }) {
  mcpServer.tool(
    toolName,
    'Disconnect a member from a voice channel.',
    {
      guildId: z.string(),
      memberId: z.string(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, memberId, reason } = _args;
      const guild = await discord.helpers.getGuild(discord, guildId);
      const member = await discord.helpers.getMember(guild, memberId);
      try {
        await member.voice.disconnect(reason);
      } catch (err) {
        throw new Error('Failed to disconnect member: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { memberId });
      return buildResponse({ success: true, memberId });
    }
  );
}
