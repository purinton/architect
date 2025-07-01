import { z, buildResponse } from '@purinton/mcp-server';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const inviteSettingsSchema = z.object({
  maxAge: z.number().optional(),
  maxUses: z.number().optional(),
  temporary: z.boolean().optional(),
  unique: z.boolean().optional(),
  reason: z.string().optional(),
});

export default async function ({ mcpServer, toolName, log, discord }) {
  // Dynamically load all method handlers from tools/invite/*.mjs
  const methods = {};
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const inviteDir = path.resolve(__dirname, 'invite');
  const files = await fs.readdir(inviteDir);
  for (const file of files) {
    if (file.endsWith('.mjs')) {
      const method = file.replace(/\.mjs$/, '');
      const mod = await import(path.join(inviteDir, file));
      if (typeof mod.default === 'function') {
        methods[method] = mod.default;
      }
    }
  }

  mcpServer.tool(
    toolName,
    'Create, delete, or list invites for a channel.',
    {
      channelId: z.string(),
      method: z.string(), // now any string, not enum
      inviteCode: z.string().optional(),
      inviteSettings: inviteSettingsSchema.nullable().optional(),
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
