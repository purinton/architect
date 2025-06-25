import { z, buildResponse } from '@purinton/mcp-server';

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
  mcpServer.tool(
    toolName,
    'Get, update, or audit a guild by ID.',
    {
      guildId: z.string(),
      method: z.enum(['get', 'update', 'audit']),
      updateSettings: updateSettingsSchema.nullable().optional(),
      auditSettings: auditSettingsSchema.nullable().optional(),
    },
    async (_args, _extra) => {
      log.debug(`[${toolName}] Request`, { _args });
      const { guildId, method, updateSettings, auditSettings } = _args;
      log.debug(`[${toolName}] Fetching guild from cache`, { guildId });
      const guild = discord.guilds.cache.get(guildId);
      if (!guild) {
        log.error(`[${toolName}] Guild not found.`, { guildId });
        throw new Error('Guild not found.');
      }
      log.debug(`[${toolName}] Guild found`, { guildId, method });
      if (method === 'get') {
        log.debug(`[${toolName}] Getting guild settings`, { guildId });
        // Return current settings
        const settings = {
          id: guild.id,
          name: guild.name,
          description: guild.description,
          icon: guild.iconURL?.({ dynamic: true, size: 1024 }),
          banner: guild.bannerURL?.({ dynamic: true, size: 1024 }),
          afkChannelId: guild.afkChannelId,
          afkTimeout: guild.afkTimeout,
          defaultMessageNotifications: guild.defaultMessageNotifications,
          explicitContentFilter: guild.explicitContentFilter,
          mfaLevel: guild.mfaLevel,
          nsfwLevel: guild.nsfwLevel,
          preferredLocale: guild.preferredLocale,
          premiumProgressBarEnabled: guild.premiumProgressBarEnabled,
          publicUpdatesChannelId: guild.publicUpdatesChannelId,
          rulesChannelId: guild.rulesChannelId,
          safetyAlertsChannelId: guild.safetyAlertsChannelId,
          splash: guild.splashURL?.({ dynamic: true, size: 1024 }),
          systemChannelFlags: guild.systemChannelFlags?.toArray?.() || undefined,
          systemChannelId: guild.systemChannelId,
          verificationLevel: guild.verificationLevel,
        };
        const cleanSettings = Object.fromEntries(Object.entries(settings).filter(([_, v]) => v !== undefined && v !== null));
        log.debug(`[${toolName}] Returning guild settings`, { cleanSettings });
        return buildResponse(cleanSettings);
      } else if (method === 'update') {
        log.debug(`[${toolName}] Updating guild settings`, { guildId, updateSettings });
        if (!updateSettings) {
          log.error(`[${toolName}] updateSettings required for update method.`, { guildId });
          throw new Error('updateSettings required for update method.');
        }
        await guild.edit(updateSettings);
        log.debug(`[${toolName}] Guild updated`, { guildId, updateSettings });
        // Return only serializable settings after update
        const settings = {
          id: guild.id,
          name: guild.name,
          description: guild.description,
          icon: guild.iconURL?.({ dynamic: true, size: 1024 }),
          banner: guild.bannerURL?.({ dynamic: true, size: 1024 }),
          afkChannelId: guild.afkChannelId,
          afkTimeout: guild.afkTimeout,
          defaultMessageNotifications: guild.defaultMessageNotifications,
          explicitContentFilter: guild.explicitContentFilter,
          mfaLevel: guild.mfaLevel,
          nsfwLevel: guild.nsfwLevel,
          preferredLocale: guild.preferredLocale,
          premiumProgressBarEnabled: guild.premiumProgressBarEnabled,
          publicUpdatesChannelId: guild.publicUpdatesChannelId,
          rulesChannelId: guild.rulesChannelId,
          safetyAlertsChannelId: guild.safetyAlertsChannelId,
          splash: guild.splashURL?.({ dynamic: true, size: 1024 }),
          systemChannelFlags: guild.systemChannelFlags?.toArray?.() || undefined,
          systemChannelId: guild.systemChannelId,
          verificationLevel: guild.verificationLevel,
        };
        const cleanSettings = Object.fromEntries(Object.entries(settings).filter(([_, v]) => v !== undefined && v !== null));
        log.debug(`[${toolName}] Returning updated guild settings`, { cleanSettings });
        return buildResponse({ updated: true, settings: cleanSettings });
      } else if (method === 'audit') {
        log.debug(`[${toolName}] Fetching audit logs`, { guildId, auditSettings });
        // Clean auditSettings: remove empty string, null, or undefined values
        const options = Object.fromEntries(
          Object.entries(auditSettings || {}).filter(
            ([key, value]) =>
              value !== undefined &&
              !(typeof value === 'string' && value.trim() === '') &&
              !(typeof value === 'number' && value === null) &&
              value !== null
          )
        );
        log.debug(`[${toolName}] Cleaned audit log options`, { options });
        const logs = await guild.fetchAuditLogs(options);
        log.debug(`[${toolName}] Audit logs fetched`, { count: logs.entries.size });
        return buildResponse({ entries: logs.entries.map(e => e.toJSON()) });
      } else {
        log.error(`[${toolName}] Invalid method.`, { method });
        throw new Error('Invalid method.');
      }
    }
  );
}
