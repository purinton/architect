import { z, buildResponse } from '@purinton/mcp-server';

// Tool: set-permissions
// Sets permission overrides for one or more channels, with merge or replace option.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Set permission overrides for one or more channels. Optionally merge with existing overrides or replace them entirely. Permission names in allow/deny will be auto-converted from ALL_CAPS to discord.helpers.js PascalCase if needed.',
    {
      channels: z.array(z.object({
        channelId: z.string(),
        overrides: z.array(z.object({
          id: z.string(),
          type: z.enum(['role', 'member']),
          allow: z.array(z.string()).optional(),
          deny: z.array(z.string()).optional(),
        })),
      })),
      guildId: z.string(),
      merge: z.boolean().optional().describe('If true, merge with existing overrides. If false, replace all overrides.'),
      reason: z.string().optional(),
    },
    async ({ guildId, channels, merge = false, reason }, _extra) => {
      log.debug(`${toolName} Request`, { guildId, channels, merge, reason });
      const results = [];
      for (const { channelId, overrides } of channels) {
        let channel;
        try {
          channel = await discord.helpers.getChannel(channelId);
        } catch (err) {
          results.push({ channelId, error: 'Channel not found.' });
          continue;
        }
        let newOverrides = overrides.map(o => ({
          ...o,
          allow: o.allow ? o.allow.map(toPascalCasePerms) : undefined,
          deny: o.deny ? o.deny.map(toPascalCasePerms) : undefined,
        }));
        newOverrides = mergePermissionOverwrites(channel.permissionOverwrites, newOverrides, merge);
        try {
          await channel.permissionOverwrites.set(newOverrides, reason);
          results.push({ channelId, success: true });
        } catch (err) {
          results.push({ channelId, error: err.message || err });
        }
      }
      const response = { results };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
