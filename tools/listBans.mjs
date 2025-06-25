import { z, buildResponse } from '@purinton/mcp-server';

// Tool: list-bans
// Lists all bans in a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'List all banned users in a guild.',
    {
      guildId: z.string(),
    },
    async (args, _extra) => {
      log.debug(`${toolName} Request`, { args });
      const { guildId } = args;
      let bans;
      try {
        bans = await discord.helpers.guilds.cache.get(guildId).bans.fetch();
      } catch (err) {
        throw new Error('Failed to fetch bans: ' + (err.message || err));
      }
      const banList = Array.from(bans.values()).map(ban => ({
        userId: ban.user.id,
        username: ban.user.username,
        discriminator: ban.user.discriminator,
        reason: ban.reason,
      }));
      log.debug(`${toolName} Response`, { response: banList });
      return buildResponse(banList);
    }
  );
}
