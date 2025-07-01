import { z, buildResponse } from '@purinton/mcp-server';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const voiceUserSettingsSchema = z.object({
  channelId: z.string().optional(), // for move
  mute: z.boolean().optional(), // for serverMute
  deafen: z.boolean().optional(), // for serverDeafen
});

export default async function ({ mcpServer, toolName, log, discord }) {
  // Dynamically load all method handlers from tools/voiceuser/*.mjs
  const methods = {};
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const voiceuserDir = path.resolve(__dirname, 'voiceuser');
  const files = await fs.readdir(voiceuserDir);
  for (const file of files) {
    if (file.endsWith('.mjs')) {
      const method = file.replace(/\.mjs$/, '');
      const mod = await import(path.join(voiceuserDir, file));
      if (typeof mod.default === 'function') {
        methods[method] = mod.default;
      }
    }
  }

  mcpServer.tool(
    toolName,
    'Voice user moderation: move, disconnect, serverMute, serverDeafen.',
    {
      guildId: z.string(),
      userId: z.string(),
      method: z.string(), // now any string, not enum
      voiceUserSettings: voiceUserSettingsSchema.nullable().optional(),
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
