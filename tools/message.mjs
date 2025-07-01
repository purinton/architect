import { z, buildResponse } from '@purinton/mcp-server';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Discord embed schema: only fields you can actually set
const embedSchema = z.object({
  title: z.string().max(256).optional(),
  description: z.string().max(4096).optional(),
  url: z.string().url().optional(),
  timestamp: z.string().optional(), // ISO8601 string
  color: z.number().optional(),
  footer: z.object({
    text: z.string().max(2048),
    icon_url: z.string().url().optional(),
  }).optional(),
  image: z.object({
    url: z.string().url(),
  }).optional(),
  thumbnail: z.object({
    url: z.string().url(),
  }).optional(),
  author: z.object({
    name: z.string().max(256),
    url: z.string().url().optional(),
    icon_url: z.string().url().optional(),
  }).optional(),
  fields: z.array(
    z.object({
      name: z.string().max(256),
      value: z.string().max(1024),
      inline: z.boolean().optional(),
    })
  ).max(25).optional(),
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
  // Dynamically load all method handlers from tools/message/*.mjs
  const methods = {};
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const messageDir = path.resolve(__dirname, 'message');
  const files = await fs.readdir(messageDir);
  for (const file of files) {
    if (file.endsWith('.mjs')) {
      const method = file.replace(/\.mjs$/, '');
      const mod = await import(path.join(messageDir, file));
      if (typeof mod.default === 'function') {
        methods[method] = mod.default;
      }
    }
  }

  mcpServer.tool(
    toolName,
    'Send, get, bulkDelete, react to, pin, or unpin messages in a channel.',
    {
      channelId: z.string(),
      method: z.string(), // now any string, not enum
      messageId: z.string().optional(),
      messageIds: z.array(z.string()).optional(),
      messageSettings: messageSettingsSchema.optional(),
      emoji: z.string().optional(),
      limit: z.number().optional(),
    },
    async (_args, _extra) => {
      try {
        log.debug(`[${toolName}] Request`, { _args });
        const { method } = _args;
        if (!method || typeof method !== 'string') {
          return buildResponse({ error: 'method required.' });
        }
        if (!methods[method]) {
          return buildResponse({ error: `Unknown method: ${method}` });
        }
        // Pass all args, plus helpers, to the method
        return await methods[method]({ ..._args, mcpServer, toolName, log, discord, buildResponse });
      } catch (err) {
        return buildResponse({ error: err?.message || String(err) });
      }
    }
  );
}
