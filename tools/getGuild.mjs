import { z } from 'zod';
import { getGuild, buildResponse } from '../toolHelpers.mjs';

export default async function (server, toolName = 'discord-get-guild') {
  server.tool(
    toolName,
    'Returns all details about a given guild/server, excluding channels, roles, and members.',
    { guildId: z.string() },
    async (args, extra) => {
      const { guildId } = args;
      const guild = getGuild(guildId);
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
      const guildInfo = Object.fromEntries(Object.entries(base).filter(([_, v]) => v !== undefined && v !== null));
      return buildResponse({ guild: guildInfo });
    }
  );
}
