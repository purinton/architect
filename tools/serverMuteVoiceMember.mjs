import { z, buildResponse } from '@purinton/mcp-server';

// Tool: server-mute-voice-member
// Mutes or unmutes a member in a voice channel.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Mute or unmute a member in a voice channel.',
    {
      guildId: z.string(),
      memberId: z.string(),
      mute: z.boolean(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      const { guildId, memberId, mute, reason } = _args;
      log.debug(`${toolName} Request`, { _args });
      try {
        const guild = await discord.helpers.guilds.fetch(guildId);
        const member = await guild.members.fetch(memberId);
        await member.voice.setMute(mute, reason);
      } catch (err) {
        throw new Error('Failed to set mute state: ' + (err.message || err));
      }
      const response = { success: true, memberId, mute };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
