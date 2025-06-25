import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Returns all details about a given guild/server, excluding channels, roles, and members.',
    { guildId: z.string() },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId } = _args;
      const guild = discord.helpers.guilds.cache.get(guildId) || await discord.helpers.guilds.fetch(guildId).catch(() => null);
      if (!guild) return buildResponse({ error: 'Guild not found' }, { status: 404 });

      let owner = { id: guild.ownerId };
      try {
        const ownerMember = guild.members?.cache.get(guild.ownerId) || await guild.members?.fetch(guild.ownerId).catch(() => null);
        if (ownerMember) {
          owner = {
            id: ownerMember.id,
            tag: ownerMember.user?.tag,
            username: ownerMember.user?.username,
            discriminator: ownerMember.user?.discriminator,
            avatar: ownerMember.user?.displayAvatarURL?.({ dynamic: true, size: 1024 }),
            joinedAt: ownerMember.joinedAt,
            displayName: ownerMember.displayName || ownerMember.nickname || ownerMember.user?.username,
          };
        }
      } catch { }
      let systemChannel = undefined;
      if (guild.systemChannelId && guild.channels?.cache) {
        const sysChan = guild.channels.cache.get(guild.systemChannelId);
        if (sysChan) {
          systemChannel = {
            id: sysChan.id,
            name: sysChan.name,
            flags: guild.systemChannelFlags?.toArray?.() || [],
          };
        }
      }
      const base = {
        id: guild.id,
        name: guild.name,
        description: guild.description,
        icon: guild.iconURL({ dynamic: true, size: 2048 }),
        banner: guild.bannerURL?.({ size: 2048 }),
        splash: guild.splashURL?.({ size: 2048 }),
        discoverySplash: guild.discoverySplashURL?.({ size: 2048 }),
        owner,
        afkChannelId: guild.afkChannelId,
        afkTimeout: guild.afkTimeout,
        systemChannel,
        widgetEnabled: guild.widgetEnabled,
        widgetChannelId: guild.widgetChannelId,
        verificationLevel: guild.verificationLevel,
        explicitContentFilter: guild.explicitContentFilter,
        mfaLevel: guild.mfaLevel,
        nsfwLevel: guild.nsfwLevel,
        preferredLocale: guild.preferredLocale,
        premiumTier: guild.premiumTier,
        premiumSubscriptionCount: guild.premiumSubscriptionCount,
        partnered: guild.partnered,
        verified: guild.verified,
        vanityURLCode: guild.vanityURLCode,
        vanityURLUses: guild.vanityURLUses,
        features: guild.features,
        maxPresences: guild.maxPresences,
        maxMembers: guild.maxMembers,
        maxStageVideoChannelUsers: guild.maxStageVideoChannelUsers,
        maxVideoChannelUsers: guild.maxVideoChannelUsers,
        publicUpdatesChannelId: guild.publicUpdatesChannelId,
        rulesChannelId: guild.rulesChannelId,
        safetyAlertsChannelId: guild.safetyAlertsChannelId,
        applicationId: guild.applicationId,
        createdAt: guild.createdAt,
        joinedAt: guild.joinedAt,
        large: guild.large,
        unavailable: guild.unavailable,
        premiumProgressBarEnabled: guild.premiumProgressBarEnabled,
        approximateMemberCount: guild.approximateMemberCount,
        approximatePresenceCount: guild.approximatePresenceCount,
      };
      const response = {
        ...base,
        owner,
        systemChannel,
        // ...other properties...
      };
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
