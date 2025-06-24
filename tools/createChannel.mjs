import { z } from 'zod';
import { getGuild, cleanOptions, mergePermissionOverwrites, toPascalCasePerms, buildResponse } from '../toolHelpers.mjs';

// Tool: create-channel
// Creates a new text channel or category in a specified guild.
export default async function (server, toolName = 'discord-create-channel') {
  server.tool(
    toolName,
    'Create a new text channel or category under a specified parent/category.',
    {
      guildId: z.string(),
      name: z.string(),
      type: z.enum(['text', 'category']).default('text'),
      parentId: z.string().optional(), // category ID for text channels
      topic: z.string().optional(),
      nsfw: z.boolean().optional(),
      position: z.number().optional(),
      rateLimitPerUser: z.number().optional(),
      permissionOverwrites: z.array(z.object({
        id: z.string(),
        type: z.enum(['role', 'member']),
        allow: z.array(z.string()).optional(),
        deny: z.array(z.string()).optional(),
      })).optional(),
    },
    async (args, extra) => {
      const { guildId, name, type, parentId, topic, nsfw, position, rateLimitPerUser, permissionOverwrites } = args;
      const guild = getGuild(guildId);
      let processedPermissionOverwrites = permissionOverwrites;
      if (Array.isArray(permissionOverwrites)) {
        processedPermissionOverwrites = permissionOverwrites.map(o => ({
          ...o,
          allow: o.allow ? o.allow.map(toPascalCasePerms) : undefined,
          deny: o.deny ? o.deny.map(toPascalCasePerms) : undefined,
        }));
      }
      // Map type to Discord.js channel type
      let discordType = 0; // Default to text
      if (type === 'category') discordType = 4;
      const options = cleanOptions({
        type: discordType,
        name,
        topic: discordType === 0 ? topic : undefined,
        nsfw,
        parent: parentId,
        position,
        rateLimitPerUser,
        permissionOverwrites: processedPermissionOverwrites,
      });
      let channel;
      try {
        channel = await guild.channels.create(options);
      } catch (err) {
        throw new Error('Failed to create channel: ' + (err.message || err));
      }
      return buildResponse({ success: true, channelId: channel.id, name: channel.name });
    }
  );
}
