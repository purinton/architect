import { z, buildResponse } from '@purinton/mcp-server';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const channelSettingsSchema = z.object({
  name: z.string().optional(),
  type: z.number().optional(), // Discord.js channel type
  topic: z.string().optional(),
  nsfw: z.boolean().optional(),
  bitrate: z.number().optional(),
  userLimit: z.number().optional(),
  parent: z.string().optional(),
  position: z.number().optional(),
  rateLimitPerUser: z.number().optional(),
  permissionOverwrites: z.any().optional(),
});

const webhookSettingsSchema = z.object({
  name: z.string().optional(),
  avatar: z.string().optional(), // URL or base64
  reason: z.string().optional(),
});

const permissionOverwriteSchema = z.object({
  id: z.string().describe("Role or user ID to apply the permission overwrite."),
  type: z.enum(['role', 'member']).describe("Type of overwrite: 'role' for role ID, 'member' for user ID"),
  allow: z.array(z.string()).optional().describe(
    "Permissions to allow, specified as an array of permission names (e.g. ['VIEW_CHANNEL', 'SEND_MESSAGES'])."
  ),
  deny: z.array(z.string()).optional().describe(
    "Permissions to deny, specified as an array of permission names (e.g. ['KICK_MEMBERS'])."
  ),
});

const VOICE_TYPES = [2, 13]; // 2: GUILD_VOICE, 13: GUILD_STAGE_VOICE
const VOICE_ONLY_SETTINGS = ['bitrate', 'userLimit'];
const NON_VOICE_ONLY_SETTINGS = ['topic', 'nsfw', 'rateLimitPerUser'];

function cleanSettingsForType(settings, type) {
  const cleaned = { ...settings };
  if (VOICE_TYPES.includes(type)) {
    for (const key of NON_VOICE_ONLY_SETTINGS) delete cleaned[key];
  } else {
    for (const key of VOICE_ONLY_SETTINGS) delete cleaned[key];
  }
  return cleaned;
}

export default async function ({ mcpServer, toolName, log, discord }) {
  // Dynamically load all method handlers from tools/channel/*.mjs
  const methods = {};
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const channelDir = path.resolve(__dirname, 'channel');
  const files = await fs.readdir(channelDir);
  for (const file of files) {
    if (file.endsWith('.mjs')) {
      const method = file.replace(/\.mjs$/, '');
      const mod = await import(path.join(channelDir, file));
      if (typeof mod.default === 'function') {
        methods[method] = mod.default;
      }
    }
  }

  mcpServer.tool(
    toolName,
    'Create, list, get, update, delete channels, manage webhooks, and manage channel permissions.',
    {
      guildId: z.string().optional(),
      channelId: z.union([z.string(), z.array(z.string())]).optional(),
      method: z.string(), // now any string, not enum
      channelSettings: z.union([channelSettingsSchema, z.array(channelSettingsSchema)]).nullable().optional(),
      webhookId: z.string().optional(),
      webhookSettings: webhookSettingsSchema.nullable().optional(),
      permissionOverwrites: z.array(permissionOverwriteSchema).optional(),
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
        return await methods[method]({ ..._args, mcpServer, toolName, log, discord, buildResponse, cleanSettingsForType });
      } catch (err) {
        return buildResponse({ error: err?.message || String(err) });
      }
    }
  );
}
