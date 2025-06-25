import { z, buildResponse } from '@purinton/mcp-server';

// Tool: create-channel
// Creates a new text channel or category in a specified guild.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create a new text channel or category under a specified parent/category.',
    {
      guildId: z.string(),
      name: z.string(),
      type: z.enum(['text', 'category']).default('text'),
      parentId: z.string().optional(),
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
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, name, type, parentId, topic, nsfw, position, rateLimitPerUser, permissionOverwrites } = _args;
      const guild = await discord.helpers.getGuild(guildId);
      let processedPermissionOverwrites = permissionOverwrites;
      if (Array.isArray(permissionOverwrites)) {
        processedPermissionOverwrites = permissionOverwrites.map(o => ({
          ...o,
          allow: o.allow ? o.allow.map(discord.helpers.toPascalCasePerms) : undefined,
          deny: o.deny ? o.deny.map(discord.helpers.toPascalCasePerms) : undefined,
        }));
      }
      let discordType = 0;
      if (type === 'category') discordType = 4;
      const options = discord.helpers.cleanOptions({
        parent: parentId,
        topic,
        nsfw,
        position,
        rateLimitPerUser,
        permissionOverwrites: processedPermissionOverwrites,
        type: discordType,
      });
      let channel;
      try {
        channel = await guild.channels.create({ name, ...options });
      } catch (err) {
        throw new Error('Failed to create channel: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { channelId: channel.id });
      return buildResponse({ success: true, channelId: channel.id });
    }
  );
}
