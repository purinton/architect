import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Returns a concise list of channels in a guild, with only the most crucial high-level information. Supports limit and always fetches from API if not in cache.',
    { guildId: z.string(), limit: z.number().min(1).max(500).optional() },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, limit = 500 } = _args;
      const guild = discord.helpers.guilds.cache.get(guildId);
      let allChannels;
      try {
        allChannels = Array.from((await guild.channels.fetch()).values());
      } catch {
        allChannels = Array.from(guild.channels.cache.values());
      }
      allChannels.sort((a, b) => a.rawPosition - b.rawPosition);
      const categories = allChannels.filter(ch => ch.type === 4); // 4 = GUILD_CATEGORY
      const otherChannels = allChannels.filter(ch => ch.type !== 4);
      const categoryMap = {};
      categories.forEach(cat => { categoryMap[cat.id] = cat.name; });
      function channelSummary(ch) {
        let isPrivate = false;
        if (ch.permissionOverwrites && ch.permissionOverwrites.cache) {
          const everyoneOverwrite = ch.permissionOverwrites.cache.get(ch.guildId);
          if (everyoneOverwrite) {
            const deny = everyoneOverwrite.deny?.bitfield || everyoneOverwrite.deny;
            if (typeof deny === 'bigint' || typeof deny === 'number') {
              isPrivate = (BigInt(deny) & 1024n) === 1024n;
            } else if (typeof deny === 'string') {
              isPrivate = (BigInt(deny) & 1024n) === 1024n;
            }
          }
        }
        return {
          id: ch.id,
          name: ch.name,
          type: ch.type,
          position: ch.rawPosition,
          parentId: ch.parentId,
          isPrivate,
        };
      }
      const channelList = otherChannels.map(channelSummary);
      log.debug(`${toolName} Response`, { response: channelList });
      return buildResponse(channelList);
    }
  );
}
