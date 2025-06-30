import { z, buildResponse } from '@purinton/mcp-server';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const emojiSettingsSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(), // base64 or URL
  roles: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

export default async function ({ mcpServer, toolName, log, discord }) {
  // Dynamically load all method handlers from tools/emoji/*.mjs
  const methods = {};
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const emojiDir = path.resolve(__dirname, 'emoji');
  const files = await fs.readdir(emojiDir);
  for (const file of files) {
    if (file.endsWith('.mjs')) {
      const method = file.replace(/\.mjs$/, '');
      try {
        const mod = await import(path.join(emojiDir, file));
        if (typeof mod.default === 'function') {
          methods[method] = mod.default;
        }
      } catch (err) {
        if (log && typeof log.error === 'function') {
          log.error(`[${toolName}] Failed to import handler ${file}: ${err.message}`);
        }
      }
    }
  }

  mcpServer.tool(
    toolName,
    'Create, delete, or get a guild emoji.',
    {
      guildId: z.string(),
      method: z.string(), // now any string, not enum
      emojiId: z.string().optional(),
      emojiSettings: emojiSettingsSchema.nullable().optional(),
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
