import { z } from 'zod';
import { getGuild, buildResponse } from '../toolHelpers.mjs';

// Tool: get-emojis
// Lists all custom emojis in a guild.
export default async function (server, toolName = 'discord-get-emojis') {
  server.tool(
    toolName,
    'List all custom emojis in the guild.',
    {
      guildId: z.string(),
    },
    async (args, extra) => {
      const { guildId } = args;
      const guild = getGuild(guildId);
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
      return buildResponse(emojis);
    }
  );
}
