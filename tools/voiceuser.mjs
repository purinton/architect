import { z, buildResponse } from '@purinton/mcp-server';

const voiceUserSettingsSchema = z.object({
  channelId: z.string().optional(), // for move
  mute: z.boolean().optional(), // for serverMute
  deafen: z.boolean().optional(), // for serverDeafen
});

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Voice user moderation: move, disconnect, serverMute, serverDeafen.',
    {
      guildId: z.string(),
      userId: z.string(),
      method: z.enum(['move', 'disconnect', 'serverMute', 'serverDeafen']),
      voiceUserSettings: voiceUserSettingsSchema.nullable().optional(),
    },
    async (_args, _extra) => {
      try {
        log.debug(`[${toolName}] Request`, { _args });
        const { guildId, userId, method, voiceUserSettings } = _args;
        const guild = discord.guilds.cache.get(guildId);
        if (!guild) {
          log.error(`[${toolName}] Guild not found.`, { guildId });
          return buildResponse({ error: 'Guild not found.' });
        }
        const member = guild.members.cache.get(userId);
        if (!member || !member.voice) {
          log.error(`[${toolName}] Member not found or not in voice.`, { userId });
          return buildResponse({ error: 'Member not found or not in voice.' });
        }
        if (method === 'move') {
          if (!voiceUserSettings?.channelId) {
            log.error(`[${toolName}] channelId required for move.`);
            return buildResponse({ error: 'channelId required for move.' });
          }
          await member.voice.setChannel(voiceUserSettings.channelId);
          log.debug(`[${toolName}] User moved`, { userId, channelId: voiceUserSettings.channelId });
          return buildResponse({ moved: true, userId, channelId: voiceUserSettings.channelId });
        } else if (method === 'disconnect') {
          await member.voice.disconnect();
          log.debug(`[${toolName}] User disconnected from voice`, { userId });
          return buildResponse({ disconnected: true, userId });
        } else if (method === 'serverMute') {
          if (typeof voiceUserSettings?.mute !== 'boolean') {
            log.error(`[${toolName}] mute (boolean) required for serverMute.`);
            return buildResponse({ error: 'mute (boolean) required for serverMute.' });
          }
          await member.voice.setMute(voiceUserSettings.mute);
          log.debug(`[${toolName}] User serverMute set`, { userId, mute: voiceUserSettings.mute });
          return buildResponse({ serverMute: true, userId, mute: voiceUserSettings.mute });
        } else if (method === 'serverDeafen') {
          if (typeof voiceUserSettings?.deafen !== 'boolean') {
            log.error(`[${toolName}] deafen (boolean) required for serverDeafen.`);
            return buildResponse({ error: 'deafen (boolean) required for serverDeafen.' });
          }
          await member.voice.setDeaf(voiceUserSettings.deafen);
          log.debug(`[${toolName}] User serverDeafen set`, { userId, deafen: voiceUserSettings.deafen });
          return buildResponse({ serverDeafen: true, userId, deafen: voiceUserSettings.deafen });
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
