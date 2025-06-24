import { z } from 'zod';
import { getGuild, getChannel, fetchAndFilterMessages, buildResponse } from '../toolHelpers.mjs';

// Tool: bulk-delete-messages
// Bulk deletes messages in a channel with advanced filtering. Returns deleted message IDs.
export default async function (server, toolName = 'discord-bulk-delete-messages') {
  server.tool(
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
    async (args, extra) => {
      const { guildId, channelId, limit, botOnly, embedOnly } = args;
      const filterArgs = { limit };
      if (botOnly !== undefined) filterArgs.botOnly = botOnly;
      if (embedOnly !== undefined) filterArgs.embedOnly = embedOnly;
      if (args.userId && args.userId !== "") filterArgs.userId = args.userId;
      if (args.contains && args.contains !== "") filterArgs.contains = args.contains;
      const guild = getGuild(guildId);
      const channel = await getChannel(guild, channelId);
      let filtered = await fetchAndFilterMessages(channel, filterArgs);
      console.log('[bulkDeleteMessages] Filtered messages:', filtered.map(m => ({ id: m.id, author: m.author?.id, created: m.createdTimestamp })));
      const now = Date.now();
      const maxAge = 14 * 24 * 60 * 60 * 1000; // 14 days in ms
      const eligible = filtered.filter(m => now - m.createdTimestamp < maxAge);
      if (filtered.length === 0) {
        return buildResponse({ success: true, deleted: [], warning: 'No messages matched the filter.' });
      }
      if (eligible.length === 0) {
        return buildResponse({ success: true, deleted: [], warning: 'No messages eligible for bulk delete (older than 14 days).' });
      }
      let deleted = [];
      try {
        const res = await channel.bulkDelete(eligible.map(m => m.id));
        deleted = Array.from(res.values()).map(m => m.id);
      } catch (err) {
        throw new Error('Failed to bulk delete messages: ' + (err.message || err));
      }
      return buildResponse({ success: true, deleted, attempted: eligible.length, matched: filtered.length });
    }
  );
}
