import { z, buildResponse } from '@purinton/mcp-server';

// Tool: pin-unpin-message
// Pins or unpins a message in a channel.
export default async function ({ mcpServer, toolName, log, discord }) {
  mcpServer.tool(
    toolName,
    'Pin or unpin a message in a channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
      messageId: z.string(),
      pin: z.boolean(),
    },
    async (_args, _extra) => {
      log.debug(`${toolName} Request`, { _args });
      const { guildId, channelId, messageId, pin } = _args;
      let response;
      try {
        const guild = await discord.helpers.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(channelId);
        const message = await channel.messages.fetch(messageId);
        
        if (pin) {
          await message.pin();
        } else {
          await message.unpin();
        }
        response = { success: true, messageId, pin };
      } catch (err) {
        throw new Error('Failed to pin/unpin message: ' + (err.message || err));
      }
      log.debug(`${toolName} Response`, { response });
      return buildResponse(response);
    }
  );
}
