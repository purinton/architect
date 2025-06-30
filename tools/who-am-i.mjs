import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    "Returns the bot's own user record, including all available properties.",
    {},
    async (_args, _extra) => {
      try {
        log.debug(`${toolName} Request`, { _args });
        const user = discord.user;
        if (!user) return buildResponse({ error: 'Bot user not found.' });
        const userInfo = {
          id: user.id,
          username: user.username,
          discriminator: user.discriminator,
          tag: user.tag,
          avatar: user.displayAvatarURL?.({ dynamic: true, size: 1024 }),
          bot: user.bot,
          createdAt: user.createdAt,
          system: user.system,
          flags: user.flags?.toArray?.() || undefined,
        };
        const cleanUserInfo = Object.fromEntries(Object.entries(userInfo).filter(([_, v]) => v !== undefined && v !== null));
        return buildResponse(cleanUserInfo);
      } catch (err) {
        return buildResponse({ error: err?.message || String(err) });
      }
    }
  );
}
