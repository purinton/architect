import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Generate a new invite link for a channel with specific parameters.',
    {
      guildId: z.string(),
      channelId: z.string(),
      maxAge: z.number().optional(), // seconds
      maxUses: z.number().optional(),
      temporary: z.boolean().optional(),
      unique: z.boolean().optional(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, channelId, maxAge, maxUses, temporary, unique, reason } = _args;
      const guild = await discord.helpers.getGuild(discord, guildId);
      const channel = await discord.helpers.getChannel(guild, channelId);
      if (typeof channel.createInvite !== 'function') throw new Error('Channel cannot create invites for this channel.');
      let invite;
      try {
        invite = await channel.createInvite({ maxAge, maxUses, temporary, unique, reason });
      } catch (err) {
        throw new Error('Failed to create invite: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { code: invite.code, url: invite.url });
      return buildResponse({ success: true, code: invite.code, url: invite.url });
    }
  );
}
