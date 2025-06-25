import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Bulk delete messages in a channel with advanced filters. Returns deleted message IDs.',
    {
      guildId: z.string(),
      channelId: z.string(),
      limit: z.number().min(1).max(100).optional(),
      botOnly: z.boolean().optional(),
      embedOnly: z.boolean().optional(),
      userId: z.string().optional(),
      contains: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, channelId, limit, botOnly, embedOnly } = _args;
      const filterArgs = { limit };
      if (botOnly !== undefined) filterArgs.botOnly = botOnly;
      if (embedOnly !== undefined) filterArgs.embedOnly = embedOnly;
      if (_args.userId && _args.userId !== "") filterArgs.userId = _args.userId;
      if (_args.contains && _args.contains !== "") filterArgs.contains = _args.contains;
      const guild = await discord.helpers.getGuild(discord, guildId);
      const channel = await discord.helpers.getChannel(guild, channelId);
      let filtered = await discord.helpers.fetchAndFilterMessages(channel, filterArgs);
      log.debug('[bulkDeleteMessages] Filtered messages:', filtered.map(m => ({ id: m.id, author: m.author?.id, created: m.createdTimestamp })));
      const now = Date.now();
      const maxAge = 14 * 24 * 60 * 60 * 1000;
      const eligible = filtered.filter(m => now - m.createdTimestamp < maxAge);
      if (filtered.length === 0) {
        return buildResponse({ success: true, deleted: [], warning: 'No messages matched the filter.' });
      }
      if (eligible.length === 0) {
        return buildResponse({ success: true, deleted: [], warning: 'No messages eligible for bulk delete (older than 14 days).' });
      }
      let deleted = [];
      try {
        deleted = await channel.bulkDelete(eligible);
      } catch (err) {
        throw new Error('Failed to bulk delete messages: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { deleted: deleted.map(m => m.id) });
      return buildResponse({ success: true, deleted: deleted.map(m => m.id) });
    }
  );
}
