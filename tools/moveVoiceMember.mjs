import { z, buildResponse } from '@purinton/mcp-server';

// Tool: move-voice-member
// Moves a member from one voice channel to another.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Move a member between two voice channels.',
    {
      guildId: z.string(),
      memberId: z.string(),
      channelId: z.string(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, memberId, channelId, reason } = _args;
      const guild = await discord.helpers.guilds.fetch(guildId);
      const member = await guild.members.fetch(memberId);
      const channel = await guild.channels.fetch(channelId);
      if (channel.type !== 2) throw new Error('Target channel is not a voice channel.');
      try {
        await member.voice.setChannel(channel, reason);
      } catch (err) {
        throw new Error('Failed to move member: ' + (err.message || err));
      }
      const response = { success: true, memberId, channelId };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
