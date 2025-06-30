import { z, buildResponse } from '@purinton/mcp-server';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const eventSettingsSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  scheduledStartTime: z.string().describe('ISO string'),
  scheduledEndTime: z.string().describe('ISO string'),
  entityType: z.number().describe('1 = Stage Instance (requires a stage channel), 2 = Voice (requires a voice channel), 3 = External (no channel required)'),
  channelId: z.string().describe('Channel ID for the event (required for stage/voice events)'),
  reason: z.string().describe('Reason for the event creation'),
  location: z.string().optional().describe('Location for external events (entityType 3). Defaults to "Not Specified"'),
});

export default async function ({ mcpServer, toolName, log, discord }) {
  // Dynamically load all method handlers from tools/event/*.mjs
  const methods = {};
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const eventDir = path.resolve(__dirname, 'event');
  const files = await fs.readdir(eventDir);
  for (const file of files) {
    if (file.endsWith('.mjs')) {
      const method = file.replace(/\.mjs$/, '');
      const mod = await import(path.join(eventDir, file));
      if (typeof mod.default === 'function') {
        methods[method] = mod.default;
      }
    }
  }

  mcpServer.tool(
    toolName,
    'Create, update, delete, or list guild events.',
    {
      guildId: z.string(),
      method: z.string(), // now any string, not enum
      eventId: z.string().optional(),
      eventSettings: eventSettingsSchema.nullable().optional(),
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
