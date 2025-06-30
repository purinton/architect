import { z, buildResponse } from '@purinton/mcp-server';

const moderateSettingsSchema = z.object({
  reason: z.string().optional(),
  deleteMessageSeconds: z.number().optional(), // for ban
  duration: z.number().optional(), // for timeout (in ms)
});

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Moderate members: ban, unban, kick, timeout, or list bans.',
    {
      guildId: z.string(),
      method: z.enum(['ban', 'unban', 'kick', 'timeout', 'listBans']),
      userId: z.string().optional(),
      moderateSettings: moderateSettingsSchema.nullable().optional(),
    },
    async (_args, _extra) => {
      try {
        log.debug(`[${toolName}] Request`, { _args });
        const { guildId, method, userId, moderateSettings } = _args;
        const guild = discord.guilds.cache.get(guildId);
        if (!guild) {
          log.error(`[${toolName}] Guild not found.`, { guildId });
          return buildResponse({ error: 'Guild not found.' });
        }
        if (['ban', 'unban', 'kick', 'timeout'].includes(method) && !userId) {
          log.error(`[${toolName}] userId required for ${method}.`);
          return buildResponse({ error: 'userId required for this method.' });
        }
        if (method === 'ban') {
          const options = {};
          if (moderateSettings?.reason) options.reason = moderateSettings.reason;
          if (moderateSettings?.deleteMessageSeconds) options.deleteMessageSeconds = moderateSettings.deleteMessageSeconds;
          await guild.members.ban(userId, options);
          log.debug(`[${toolName}] User banned`, { userId });
          return buildResponse({ banned: true, userId });
        } else if (method === 'unban') {
          await guild.members.unban(userId);
          log.debug(`[${toolName}] User unbanned`, { userId });
          return buildResponse({ unbanned: true, userId });
        } else if (method === 'kick') {
          const member = guild.members.cache.get(userId);
          if (!member) {
            log.error(`[${toolName}] Member not found for kick.`, { userId });
            return buildResponse({ error: 'Member not found.' });
          }
          await member.kick(moderateSettings?.reason);
          log.debug(`[${toolName}] User kicked`, { userId });
          return buildResponse({ kicked: true, userId });
        } else if (method === 'timeout') {
          const member = guild.members.cache.get(userId);
          if (!member) {
            log.error(`[${toolName}] Member not found for timeout.`, { userId });
            return buildResponse({ error: 'Member not found.' });
          }
          if (!moderateSettings?.duration) {
            log.error(`[${toolName}] duration required for timeout.`);
            return buildResponse({ error: 'duration required for timeout.' });
          }
          await member.timeout(moderateSettings.duration, moderateSettings?.reason);
          log.debug(`[${toolName}] User timed out`, { userId });
          return buildResponse({ timedOut: true, userId, duration: moderateSettings.duration });
        } else if (method === 'listBans') {
          const bans = await guild.bans.fetch();
          const banList = bans.map(ban => ({ userId: ban.user.id, tag: ban.user.tag, reason: ban.reason }));
          log.debug(`[${toolName}] Ban list fetched`, { count: banList.length });
          return buildResponse({ bans: banList });
        } else {
          log.error(`[${toolName}] Invalid method.`, { method });
          return buildResponse({ error: 'Invalid method.' });
        }
      } catch (err) {
        return buildResponse({ error: err?.message || String(err) });
      }
    }
  );
}
