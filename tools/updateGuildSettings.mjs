import { z, buildResponse } from '@purinton/mcp-server';

// Tool: update-guild-settings
// Allows updating all possible guild-wide settings via discord.helpers.js Guild.edit()
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Modify any guild-wide settings supported by discord.helpers.js Guild.edit().',
    {
      afkChannelId: z.string().optional(),
      afkTimeout: z.number().optional(),
      banner: z.string().optional(),
      defaultMessageNotifications: z.enum(['ALL_MESSAGES', 'ONLY_MENTIONS']).optional(),
      description: z.string().optional(),
      discoverySplash: z.string().optional(),
      explicitContentFilter: z.number().optional(),
      guildId: z.string(),
      icon: z.string().optional(),
      mfaLevel: z.number().optional(),
      name: z.string().optional(),
      nsfwLevel: z.number().optional(),
      preferredLocale: z.string().optional(),
      premiumProgressBarEnabled: z.boolean().optional(),
      publicUpdatesChannelId: z.string().optional(),
      rulesChannelId: z.string().optional(),
      safetyAlertsChannelId: z.string().optional(),
      splash: z.string().optional(),
      systemChannelFlags: z.array(z.string()).optional(),
      systemChannelId: z.string().optional(),
      verificationLevel: z.number().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, ...updateFields } = _args;
      const guild = await discord.helpers.guilds.fetch(guildId);
      if (Array.isArray(updateFields.systemChannelFlags)) {
        updateFields.systemChannelFlags = updateFields.systemChannelFlags.reduce((acc, flag) => {
          if (Guild.SystemChannelFlagsBits && Guild.SystemChannelFlagsBits[flag]) return acc | Guild.SystemChannelFlagsBits[flag];
          return acc;
        }, 0);
      }
      let response;
      try {
        response = await guild.edit(updateFields);
      } catch (err) {
        throw new Error('Failed to update guild settings: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
