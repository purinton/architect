import { z, buildResponse } from '@purinton/mcp-server';

// Tool: create-voice-channel
// Creates a new voice channel in a specified guild and (optionally) category.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Create a new voice channel under a specified category.',
    {
      guildId: z.string(),
      name: z.string(),
      parentId: z.string().optional(),
      bitrate: z.number().optional(),
      userLimit: z.number().optional(),
      rtcRegion: z.string().optional(),
      position: z.number().optional(),
      permissionOverwrites: z.array(z.object({
        id: z.string(),
        type: z.enum(['role', 'member']),
        allow: z.array(z.string()).optional(),
        deny: z.array(z.string()).optional(),
      })).optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, name, parentId, bitrate, userLimit, rtcRegion, position, permissionOverwrites } = _args;
      const guild = await discord.getGuild(guildId);
      let processedPermissionOverwrites = permissionOverwrites;
      if (Array.isArray(permissionOverwrites)) {
        processedPermissionOverwrites = permissionOverwrites.map(o => ({
          ...o,
          allow: o.allow ? o.allow.map(discord.toPascalCasePerms) : undefined,
          deny: o.deny ? o.deny.map(discord.toPascalCasePerms) : undefined,
        }));
      }
      const options = discord.cleanOptions({
        type: 2, // 2 = GUILD_VOICE
        name,
        parent: parentId,
        bitrate,
        userLimit,
        rtcRegion,
        position,
        permissionOverwrites: processedPermissionOverwrites,
      });
      let channel;
      try {
        channel = await guild.channels.create(options);
      } catch (err) {
        throw new Error('Failed to create voice channel: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { channelId: channel.id });
      return buildResponse({ success: true, channelId: channel.id });
    }
  );
}
