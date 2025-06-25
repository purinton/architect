import { z, buildResponse } from '@purinton/mcp-server';

// Tool: list-stickers
// Lists all stickers in a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'List all stickers in a guild.',
    {
      guildId: z.string(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId } = _args;
      let stickers;
      try {
        stickers = await discord.guilds.cache.get(guildId).stickers.fetch();
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
      const response = { stickers: stickerList };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
