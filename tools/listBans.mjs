import { z } from 'zod';
import { getGuild, buildResponse } from '../toolHelpers.mjs';

// Tool: list-bans
// Lists all bans in a guild.
export default async function (server, toolName = 'discord-list-bans') {
  server.tool(
    toolName,
    'List all banned users in a guild.',
    {
      guildId: z.string(),
    },
    async (args, extra) => {
      const { guildId } = args;
      const guild = getGuild(guildId);
      let bans;
      try {
        bans = await guild.bans.fetch();
      } catch (err) {
        throw new Error('Failed to fetch bans: ' + (err.message || err));
      }
      const banList = Array.from(bans.values()).map(ban => ({
        userId: ban.user.id,
        username: ban.user.username,
        discriminator: ban.user.discriminator,
        reason: ban.reason,
      }));
      return buildResponse(banList);
    }
  );
}
