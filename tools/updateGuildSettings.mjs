import { z } from 'zod';
import { Guild } from 'discord.js';
import { getGuild, cleanOptions, buildResponse } from '../toolHelpers.mjs';

// Tool: update-guild-settings
// Allows updating all possible guild-wide settings via Discord.js Guild.edit()
export default async function (server, toolName = 'discord-update-guild-settings') {
  server.tool(
    toolName,
    'Modify any guild-wide settings supported by Discord.js Guild.edit().',
    {
      guildId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      icon: z.string().optional(), // base64 or URL
      banner: z.string().optional(), // base64 or URL
      splash: z.string().optional(), // base64 or URL
      discoverySplash: z.string().optional(), // base64 or URL
      afkChannelId: z.string().optional(),
      afkTimeout: z.number().optional(),
      systemChannelId: z.string().optional(),
      systemChannelFlags: z.array(z.string()).optional(),
      verificationLevel: z.number().optional(),
      explicitContentFilter: z.number().optional(),
      defaultMessageNotifications: z.enum(['ALL_MESSAGES', 'ONLY_MENTIONS']).optional(),
      mfaLevel: z.number().optional(),
      nsfwLevel: z.number().optional(),
      preferredLocale: z.string().optional(),
      premiumProgressBarEnabled: z.boolean().optional(),
      rulesChannelId: z.string().optional(),
      publicUpdatesChannelId: z.string().optional(),
      safetyAlertsChannelId: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, ...updateFields } = args;
      const guild = getGuild(guildId);
      if (Array.isArray(updateFields.systemChannelFlags)) {
        updateFields.systemChannelFlags = updateFields.systemChannelFlags.reduce((acc, flag) => {
          if (Guild.SystemChannelFlagsBits && Guild.SystemChannelFlagsBits[flag]) return acc | Guild.SystemChannelFlagsBits[flag];
          return acc;
        }, 0);
      }
      if (updateFields.defaultMessageNotifications !== undefined) {
        updateFields.defaultMessageNotifications =
          updateFields.defaultMessageNotifications === 'ALL_MESSAGES' ? 0 : 1;
      }
      const cleaned = cleanOptions(updateFields);
      if (!cleaned || Object.keys(cleaned).length === 0) {
        throw new Error('No settings provided to update.');
      }
      let updatedGuild;
      try {
        updatedGuild = await guild.edit(cleaned);
      } catch (err) {
        throw new Error('Failed to update guild settings: ' + (err.message || err));
      }
      const summary = {
        id: updatedGuild.id,
        name: updatedGuild.name,
        description: updatedGuild.description,
        icon: updatedGuild.icon,
        banner: updatedGuild.banner,
        splash: updatedGuild.splash,
        discoverySplash: updatedGuild.discoverySplash,
        afkChannelId: updatedGuild.afkChannelId,
        afkTimeout: updatedGuild.afkTimeout,
        systemChannelId: updatedGuild.systemChannelId,
        systemChannelFlags: updatedGuild.systemChannelFlags,
        verificationLevel: updatedGuild.verificationLevel,
        explicitContentFilter: updatedGuild.explicitContentFilter,
        defaultMessageNotifications: updatedGuild.defaultMessageNotifications,
        mfaLevel: updatedGuild.mfaLevel,
        nsfwLevel: updatedGuild.nsfwLevel,
        preferredLocale: updatedGuild.preferredLocale,
        premiumProgressBarEnabled: updatedGuild.premiumProgressBarEnabled,
        rulesChannelId: updatedGuild.rulesChannelId,
        publicUpdatesChannelId: updatedGuild.publicUpdatesChannelId,
        safetyAlertsChannelId: updatedGuild.safetyAlertsChannelId,
      };
      return buildResponse({ success: true, updated: summary });
    }
  );
}
