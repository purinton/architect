import { z } from 'zod';
import { getGuild, cleanOptions, mergePermissionOverwrites, toPascalCasePerms, buildResponse } from '../toolHelpers.mjs';

// Tool: create-voice-channel
// Creates a new voice channel in a specified guild and (optionally) category.
export default async function (server, toolName = 'discord-create-voice-channel') {
  server.tool(
    toolName,
    'Create a new voice channel under a specified category.',
    {
      guildId: z.string(),
      name: z.string(),
      parentId: z.string().optional(), // category ID
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
    async (args, extra) => {
      const { guildId, name, parentId, bitrate, userLimit, rtcRegion, position, permissionOverwrites } = args;
      const guild = getGuild(guildId);
      let processedPermissionOverwrites = permissionOverwrites;
      if (Array.isArray(permissionOverwrites)) {
        processedPermissionOverwrites = mergePermissionOverwrites(null, permissionOverwrites.map(o => ({
          ...o,
          allow: o.allow ? o.allow.map(toPascalCasePerms) : undefined,
          deny: o.deny ? o.deny.map(toPascalCasePerms) : undefined,
        })), false);
      }
      const options = cleanOptions({
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
      return buildResponse({ success: true, channelId: channel.id });
    }
  );
}
