import { z, buildResponse } from '@purinton/mcp-server';

// Tool: get-messages
// Fetches up to the last 100 messages from a channel in a guild. Supports pagination and always fetches from API if not in cache.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Fetch up to the last 100 messages from a channel. Supports pagination.',
    {
      guildId: z.string(),
      channelId: z.string(),
      after: z.string().optional(),
      before: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, channelId, limit = 100, before, after } = _args;
      const guild = discord.guilds.cache.get(guildId);
      const channel = await discord.channels.fetch(channelId).catch(() => null);
      if (!channel || typeof channel.messages?.fetch !== 'function') throw new Error('Channel cannot fetch messages.');
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
      log.debug(`${toolName} Response`, { response: messageList });
      return buildResponse(messageList);
    }
  );
}
