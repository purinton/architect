import { z, buildResponse } from '@purinton/mcp-server';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const roleSettingsSchema = z.object({
  name: z.string().optional(),
  color: z.union([z.string(), z.number()]).optional(),
  hoist: z.boolean().optional(),
  position: z.number().optional(),
  permissions: z.array(z.string())
    .optional()
    .describe(
      "Permissions to set, specified as an array of permission names (e.g. ['ViewChannel','SendMessages'])."
    ),
  mentionable: z.boolean().optional(),
});

const memberRoleSchema = z.object({
  memberId: z.union([z.string(), z.array(z.string())]),
  roleId: z.union([z.string(), z.array(z.string())]),
});

export default async function ({ mcpServer, toolName, log, discord }) {
  // Dynamically load all method handlers from tools/role/*.mjs
  const methods = {};
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const roleDir = path.resolve(__dirname, 'role');
  const files = await fs.readdir(roleDir);
  for (const file of files) {
    if (file.endsWith('.mjs')) {
      const method = file.replace(/\.mjs$/, '');
      const mod = await import(path.join(roleDir, file));
      if (typeof mod.default === 'function') {
        methods[method] = mod.default;
      }
    }
  }

  mcpServer.tool(
    toolName,
    'Create, list, get, update, delete roles, and add/remove role(s) from member(s).',
    {
      guildId: z.string().optional(),
      roleId: z.union([z.string(), z.array(z.string())]).optional(),
      method: z.string(), // now any string, not enum
      roleSettings: z.union([roleSettingsSchema, z.array(roleSettingsSchema)]).nullable().optional(),
      memberRole: memberRoleSchema.nullable().optional(),
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
