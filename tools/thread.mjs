import { z, buildResponse } from '@purinton/mcp-server';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const threadSettingsSchema = z.object({
  name: z.string().optional(),
  autoArchiveDuration: z.number().optional(),
  rateLimitPerUser: z.number().optional(),
  type: z.number().optional(),
  reason: z.string().optional(),
});

export default async function ({ mcpServer, toolName, log, discord }) {
  // Dynamically load all method handlers from tools/thread/*.mjs
  const methods = {};
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const threadDir = path.resolve(__dirname, 'thread');
  const files = await fs.readdir(threadDir);
  for (const file of files) {
    if (file.endsWith('.mjs')) {
      const method = file.replace(/\.mjs$/, '');
      const mod = await import(path.join(threadDir, file));
      if (typeof mod.default === 'function') {
        methods[method] = mod.default;
      }
    }
  }

  mcpServer.tool(
    toolName,
    'Create, list, get, update, delete, or archive one or more threads by ID.',
    {
      channelId: z.string().optional(),
      threadId: z.union([z.string(), z.array(z.string())]).optional(),
      method: z.string(), // now any string, not enum
      threadSettings: z.union([threadSettingsSchema, z.array(threadSettingsSchema)]).nullable().optional(),
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
