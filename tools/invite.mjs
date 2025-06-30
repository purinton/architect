import { z, buildResponse } from '@purinton/mcp-server';

const inviteSettingsSchema = z.object({
  maxAge: z.number().optional(),
  maxUses: z.number().optional(),
  temporary: z.boolean().optional(),
  unique: z.boolean().optional(),
  reason: z.string().optional(),
});

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create, delete, or list invites for a channel.',
    {
      channelId: z.string(),
      method: z.enum(['create', 'delete', 'list']),
      inviteCode: z.string().optional(),
      inviteSettings: inviteSettingsSchema.nullable().optional(),
    },
    async (_args, _extra) => {
      try {
        log.debug(`[${toolName}] Request`, { _args });
        const { channelId, method, inviteCode, inviteSettings } = _args;
        const channel = discord.channels.cache.get(channelId);
        if (!channel || !channel.createInvite) return buildResponse({ error: 'Channel not found or cannot create invites.' });
        if (method === 'create') {
          const invite = await channel.createInvite(inviteSettings || {});
          return buildResponse({ created: true, code: invite.code, url: invite.url });
        } else if (method === 'delete') {
          if (!inviteCode) return buildResponse({ error: 'inviteCode required for delete.' });
          const invite = await discord.fetchInvite(inviteCode);
          if (!invite) return buildResponse({ error: 'Invite not found.' });
          await invite.delete();
          return buildResponse({ deleted: true, code: inviteCode });
        } else if (method === 'list') {
          const invites = await channel.fetchInvites();
          return buildResponse({ invites: invites.map(i => ({ code: i.code, url: i.url, uses: i.uses })) });
        } else {
          return buildResponse({ error: 'Invalid method.' });
        }
      } catch (err) {
        return buildResponse({ error: err?.message || String(err) });
      }
    }
  );
}
