import { z, buildResponse } from '@purinton/mcp-server';

// Tool: server-deafen-voice-member
// Deafens or undeafens a member in a voice channel.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Deafen or undeafen a member in a voice channel.',
    {
      guildId: z.string(),
      memberId: z.string(),
      deaf: z.boolean(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, memberId, deaf, reason } = _args;
      try {
        const guild = await discord.guilds.fetch(guildId);
        const member = await guild.members.fetch(memberId);
        await member.voice.setDeaf(deaf, reason);
      } catch (err) {
        throw new Error('Failed to set deafen state: ' + (err.message || err));
      }
      const response = { success: true, memberId, deaf };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
