import { z, buildResponse } from '@purinton/mcp-server';

// Tool: update-channel
// Updates properties of a channel in a guild, with validation for channel type and improved error handling.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Update channel name, topic, NSFW flag, bitrate, user limit, and more. Validates properties for channel type and returns updated summary.',
    {
      guildId: z.string(),
      channelId: z.string(),
      archived: z.boolean().optional(),
      bitrate: z.number().optional(),
      locked: z.boolean().optional(),
      name: z.string().optional(),
      nsfw: z.boolean().optional(),
      parentId: z.string().optional(),
      permissionOverwrites: z.array(z.object({
        allow: z.array(z.string()).optional(),
        deny: z.array(z.string()).optional(),
        id: z.string(),
        type: z.enum(['role', 'member']),
      })).optional(),
      position: z.number().optional(),
      rateLimitPerUser: z.number().optional(),
      topic: z.string().optional(),
      userLimit: z.number().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const textTypes = [0, 5, 15, 13]; // GUILD_TEXT, ANNOUNCEMENT, FORUM, STAGE
      const voiceTypes = [2]; // GUILD_VOICE
      const { guildId, channelId, ...updateFields } = _args;
      const guild = discord.helpers.getGuild(guildId);
      const channel = await discord.helpers.getChannel(guild, channelId);
      if (Array.isArray(updateFields.permissionOverwrites)) {
        updateFields.permissionOverwrites = discord.helpers.mergePermissionOverwrites(
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
      const cleaned = discord.helpers.cleanOptions(updateFields);
      let response;
      try {
        response = await channel.edit(cleaned);
      } catch (err) {
        throw new Error('Failed to update channel: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
