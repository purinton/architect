import { z } from 'zod';
import { getGuild, getChannel, buildResponse } from '../toolHelpers.mjs';

// Tool: create-invite
// Creates a new invite link for a channel in a guild.
export default async function (server, toolName = 'discord-create-invite') {
  server.tool(
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
    async (args, extra) => {
      const { guildId, channelId, maxAge, maxUses, temporary, unique, reason } = args;
      const guild = getGuild(guildId);
      const channel = await getChannel(guild, channelId);
      if (typeof channel.createInvite !== 'function') throw new Error('Channel cannot create invites for this channel.');
      let invite;
      try {
        invite = await channel.createInvite({ maxAge, maxUses, temporary, unique, reason });
      } catch (err) {
        throw new Error('Failed to create invite: ' + (err.message || err));
      }
      return buildResponse({ success: true, code: invite.code, url: invite.url });
    }
  );
}
