import { z } from 'zod';
import { getGuild, getChannel, cleanOptions, toPascalCasePerms, mergePermissionOverwrites, buildResponse } from '../toolHelpers.mjs';

// Tool: update-channel
// Updates properties of a channel in a guild, with validation for channel type and improved error handling.
export default async function (server, toolName = 'discord-update-channel') {
  server.tool(
    toolName,
    'Update channel name, topic, NSFW flag, bitrate, user limit, and more. Validates properties for channel type and returns updated summary.',
    {
      guildId: z.string(),
      channelId: z.string(),
      name: z.string().optional(),
      topic: z.string().optional(),
      nsfw: z.boolean().optional(),
      position: z.number().optional(),
      rateLimitPerUser: z.number().optional(),
      parentId: z.string().optional(),
      bitrate: z.number().optional(),
      userLimit: z.number().optional(),
      permissionOverwrites: z.array(z.object({
        id: z.string(),
        type: z.enum(['role', 'member']),
        allow: z.array(z.string()).optional(),
        deny: z.array(z.string()).optional(),
      })).optional(),
      archived: z.boolean().optional(),
      locked: z.boolean().optional(),
    },
    async (args, extra) => {
      const textTypes = [0, 5, 15, 13]; // GUILD_TEXT, ANNOUNCEMENT, FORUM, STAGE
      const voiceTypes = [2]; // GUILD_VOICE
      const { guildId, channelId, ...updateFields } = args;
      const guild = getGuild(guildId);
      const channel = await getChannel(guild, channelId);
      if (Array.isArray(updateFields.permissionOverwrites)) {
        updateFields.permissionOverwrites = mergePermissionOverwrites(
          channel.permissionOverwrites,
          updateFields.permissionOverwrites
        );
      }
      if (updateFields.parentId !== undefined) {
        updateFields.parent = updateFields.parentId;
        delete updateFields.parentId;
      }
      // Remove irrelevant fields based on channel type
      if (!voiceTypes.includes(channel.type)) {
        delete updateFields.bitrate;
        delete updateFields.userLimit;
      }
      if (!textTypes.includes(channel.type)) {
        delete updateFields.topic;
      }
      if (updateFields.archived !== undefined && channel.type !== 11 && channel.type !== 12) {
        delete updateFields.archived;
      }
      if (updateFields.locked !== undefined && channel.type !== 11 && channel.type !== 12) {
        delete updateFields.locked;
      }
      const cleaned = cleanOptions(updateFields);
      let updatedChannel;
      try {
        updatedChannel = await channel.edit(cleaned);
      } catch (err) {
        throw new Error('Failed to update channel: ' + (err.message || err));
      }
      const summary = {
        id: updatedChannel.id,
        name: updatedChannel.name,
        type: updatedChannel.type,
        topic: updatedChannel.topic,
        nsfw: updatedChannel.nsfw,
        position: updatedChannel.rawPosition,
        parentId: updatedChannel.parentId,
        bitrate: updatedChannel.bitrate,
        userLimit: updatedChannel.userLimit,
        archived: updatedChannel.archived,
        locked: updatedChannel.locked,
      };
      return buildResponse({ success: true, updated: summary });
    }
  );
}
