import { z } from 'zod';
import { getGuild, buildResponse } from '../toolHelpers.mjs';

// Tool: list-stickers
// Lists all stickers in a guild.
export default async function (server, toolName = 'discord-list-stickers') {
  server.tool(
    toolName,
    'List all stickers in a guild.',
    {
      guildId: z.string(),
    },
    async (args, extra) => {
      const { guildId } = args;
      const guild = getGuild(guildId);
      let stickers;
      try {
        stickers = await guild.stickers.fetch();
      } catch (err) {
        throw new Error('Failed to fetch stickers: ' + (err.message || err));
      }
      const stickerList = Array.from(stickers.values()).map(st => ({
        id: st.id,
        name: st.name,
        description: st.description,
        formatType: st.format,
        tags: st.tags,
        available: st.available,
        url: st.url,
      }));
      return buildResponse(stickerList);
    }
  );
}
