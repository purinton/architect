import { z } from 'zod';
import { getGuild, getChannel, buildResponse } from '../toolHelpers.mjs';

// Tool: get-messages
// Fetches up to the last 100 messages from a channel in a guild. Supports pagination and always fetches from API if not in cache.
export default async function (server, toolName = 'discord-get-messages') {
  server.tool(
    toolName,
    'Fetch up to the last 100 messages from a channel. Supports pagination.',
    {
      guildId: z.string(),
      channelId: z.string(),
      limit: z.number().min(1).max(100).optional(),
      before: z.string().optional(),
      after: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, channelId, limit = 100, before, after } = args;
      const guild = getGuild(guildId);
      const channel = await getChannel(guild, channelId);
      if (typeof channel.messages?.fetch !== 'function') throw new Error('Channel cannot fetch messages.');
      const beforeId = before && before !== '' ? before : undefined;
      const afterId = after && after !== '' ? after : undefined;
      let messages;
      try {
        messages = await channel.messages.fetch({ limit, before: beforeId, after: afterId });
      } catch (err) {
        throw new Error('Failed to fetch messages: ' + (err.message || err));
      }
      const messageList = Array.from(messages.values()).map(msg => ({
        id: msg.id,
        author: {
          id: msg.author.id,
          username: msg.author.username,
          discriminator: msg.author.discriminator,
          bot: msg.author.bot,
        },
        content: msg.content,
        createdAt: msg.createdAt,
        attachments: msg.attachments ? Array.from(msg.attachments.values()).map(a => ({
          id: a.id,
          url: a.url,
          name: a.name,
        })) : [],
        embeds: msg.embeds || [],
        referencedMessageId: msg.reference?.messageId,
        type: msg.type,
      }));
      return buildResponse(messageList);
    }
  );
}
