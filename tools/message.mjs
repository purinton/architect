import { z, buildResponse } from '@purinton/mcp-server';

// Define a stricter schema for embeds and files to be OpenAI-compatible
const embedSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
  color: z.number().optional(),
  // Add more fields as needed for your use case
});
const fileSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
  // Add more fields as needed for your use case
});

const messageSettingsSchema = z.object({
  content: z.string().optional(),
  embeds: z.array(embedSchema).optional(),
  files: z.array(fileSchema).optional(),
  tts: z.boolean().optional(),
  reason: z.string().optional(),
});

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Send, get, bulkDelete, react to, pin, or unpin messages in a channel.',
    {
      channelId: z.string(),
      method: z.enum(['send', 'get', 'bulkDelete', 'react', 'pin', 'unpin']),
      messageId: z.string().optional(),
      messageIds: z.array(z.string()).optional(),
      messageSettings: messageSettingsSchema.optional(),
      emoji: z.string().optional(),
      limit: z.number().optional(),
    },
    async (_args, _extra) => {
      log.debug(`[${toolName}] Request`, { _args });
      const { channelId, method, messageId, messageIds, messageSettings, emoji, limit } = _args;
      const channel = discord.channels.cache.get(channelId);
      if (!channel || !channel.send) throw new Error('Channel not found or cannot send messages.');
      if (method === 'send') {
        if (!messageSettings?.content && !messageSettings?.embeds && !messageSettings?.files) throw new Error('content, embeds, or files required for send.');
        const msg = await channel.send(messageSettings);
        return buildResponse({ sent: true, id: msg.id });
      } else if (method === 'get') {
        const msgs = await channel.messages.fetch({ limit: Math.min(limit || 50, 100) });
        return buildResponse({ messages: msgs.map(m => ({ id: m.id, content: m.content, author: m.author.id })) });
      } else if (method === 'bulkDelete') {
        if (!messageIds || !messageIds.length) throw new Error('messageIds required for bulkDelete.');
        const deleted = await channel.bulkDelete(messageIds);
        return buildResponse({ deleted: true, count: deleted.size });
      } else if (method === 'react') {
        if (!messageId || !emoji) throw new Error('messageId and emoji required for react.');
        const msg = await channel.messages.fetch(messageId);
        if (!msg) throw new Error('Message not found.');
        await msg.react(emoji);
        return buildResponse({ reacted: true, messageId, emoji });
      } else if (method === 'pin') {
        if (!messageId) throw new Error('messageId required for pin.');
        const msg = await channel.messages.fetch(messageId);
        if (!msg) throw new Error('Message not found.');
        await msg.pin();
        return buildResponse({ pinned: true, messageId });
      } else if (method === 'unpin') {
        if (!messageId) throw new Error('messageId required for unpin.');
        const msg = await channel.messages.fetch(messageId);
        if (!msg) throw new Error('Message not found.');
        await msg.unpin();
        return buildResponse({ unpinned: true, messageId });
      } else {
        throw new Error('Invalid method.');
      }
    }
  );
}
