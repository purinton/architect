export default async function ({ guildId, updateSettings, log, discord, buildResponse, toolName }) {
  const guild = discord.guilds.cache.get(guildId);
  if (!guild) {
    log.error(`[${toolName}] Guild not found.`, { guildId });
    return buildResponse({ error: 'Guild not found.' });
  }
  log.debug(`[${toolName}] Updating guild settings`, { guildId, updateSettings });
  if (!updateSettings) {
    log.error(`[${toolName}] updateSettings required for update method.`, { guildId });
    return buildResponse({ error: 'updateSettings required for update method.' });
  }
  // Clean updateSettings: remove null or undefined values
  const cleanedUpdateSettings = Object.fromEntries(
    Object.entries(updateSettings).filter(([_, v]) => v !== undefined && v !== null)
  );
  log.debug(`[${toolName}] Cleaned update settings`, { cleanedUpdateSettings });
  await guild.edit(cleanedUpdateSettings);
  log.debug(`[${toolName}] Guild updated`, { guildId, cleanedUpdateSettings });
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
}
