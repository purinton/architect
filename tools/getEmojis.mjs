import { z, buildResponse } from '@purinton/mcp-server';

// Tool: get-emojis
// Lists all custom emojis in a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'List all custom emojis in the guild.',
    {
      guildId: z.string(),
    },
    async (args, extra) => {
      log.debug(`${toolName} Request`, { args });
      const { guildId } = args;
      const guild = discord.helpers.guilds.cache.get(guildId);
      const emojis = guild.emojis.cache.map(e => ({
        id: e.id,
        name: e.name,
        animated: e.animated,
        url: e.url,
        available: e.available,
        createdAt: e.createdAt,
        requiresColons: e.requiresColons,
        managed: e.managed,
        roles: e.roles.cache.map(r => r.id),
      }));
      log.debug(`${toolName} Response`, { response: emojis });
      return buildResponse(emojis);
    }
  );
}
