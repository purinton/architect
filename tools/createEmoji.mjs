import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Upload a new custom emoji to the guild.',
    {
      guildId: z.string(),
      name: z.string(),
      image: z.string(), // URL or base64
      roles: z.array(z.string()).optional(),
      reason: z.string().optional(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, name, image, roles, reason } = _args;
      const guild = await discord.helpers.getGuild(guildId);
      let emoji;
      try {
        emoji = await guild.emojis.create({ name, attachment: image, roles, reason });
      } catch (err) {
        throw new Error('Failed to create emoji: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { emojiId: emoji.id, name: emoji.name });
      return buildResponse({ success: true, emojiId: emoji.id, name: emoji.name });
    }
  );
}
