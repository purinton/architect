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
      log.debug(`${toolName} Request`, { _args });
      const { guildId, method, updateSettings, auditSettings } = _args;
      const guild = discord.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      if (method === 'get') {
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
        return buildResponse(cleanSettings);
      } else if (method === 'update') {
        if (!updateSettings) throw new Error('updateSettings required for update method.');
        await guild.edit(updateSettings);
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
        return buildResponse({ updated: true, settings: cleanSettings });
      } else if (method === 'audit') {
        const options = auditSettings || {};
        const logs = await guild.fetchAuditLogs(options);
        return buildResponse({ entries: logs.entries.map(e => e.toJSON()) });
      } else {
        throw new Error('Invalid method.');
      }
    }
  );
}
