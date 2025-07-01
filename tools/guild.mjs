
import { z, buildResponse } from '@purinton/mcp-server';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const updateSettingsSchema = z.object({
  afkChannelId: z.string().nullable().optional(),
  afkTimeout: z.number().nullable().optional(),
  banner: z.string().nullable().optional(),
  defaultMessageNotifications: z.enum(['ALL_MESSAGES', 'ONLY_MENTIONS']).nullable().optional(),
  description: z.string().nullable().optional(),
  discoverySplash: z.string().nullable().optional(),
  explicitContentFilter: z.number().nullable().optional(),
  icon: z.string().nullable().optional(),
  mfaLevel: z.number().nullable().optional(),
  name: z.string().nullable().optional(),
  nsfwLevel: z.number().nullable().optional(),
  preferredLocale: z.string().nullable().optional(),
  premiumProgressBarEnabled: z.boolean().nullable().optional(),
  publicUpdatesChannelId: z.string().nullable().optional(),
  rulesChannelId: z.string().nullable().optional(),
  safetyAlertsChannelId: z.string().nullable().optional(),
  splash: z.string().nullable().optional(),
  systemChannelFlags: z.array(z.string()).nullable().optional(),
  systemChannelId: z.string().nullable().optional(),
  verificationLevel: z.number().nullable().optional(),
});

const auditSettingsSchema = z.object({
  actionType: z.number().optional(),
  before: z.string().optional(),
  limit: z.number().optional(),
  userId: z.string().optional(),
});

export default async function ({ mcpServer, toolName, log, discord }) {
  // Dynamically load all method handlers from tools/guild/*.mjs
  const methods = {};
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const guildDir = path.resolve(__dirname, 'guild');
  const files = await fs.readdir(guildDir);
  for (const file of files) {
    if (file.endsWith('.mjs')) {
      const method = file.replace(/\.mjs$/, '');
      const mod = await import(path.join(guildDir, file));
      if (typeof mod.default === 'function') {
        methods[method] = mod.default;
      }
    }
  }

  mcpServer.tool(
    toolName,
    'Get, update, or audit a guild by ID.',
    {
      guildId: z.string(),
      method: z.string(), // now any string, not enum
      updateSettings: updateSettingsSchema.nullable().optional(),
      auditSettings: auditSettingsSchema.nullable().optional(),
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
