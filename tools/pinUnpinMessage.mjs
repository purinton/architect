import { z } from 'zod';
import { getGuild, getChannel, getMessage, buildResponse } from '../toolHelpers.mjs';

// Tool: pin-unpin-message
// Pins or unpins a message in a channel.
export default async function (server, toolName = 'discord-pin-unpin-message') {
  server.tool(
    toolName,
    'Pin or unpin a message in a channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
      messageId: z.string(),
      pin: z.boolean(),
    },
    async (args, extra) => {
      const { guildId, channelId, messageId, pin } = args;
      const guild = getGuild(guildId);
      const channel = await getChannel(guild, channelId);
      const message = await getMessage(channel, messageId);
      try {
        if (pin) {
          await message.pin();
        } else {
          await message.unpin();
        }
      } catch (err) {
        throw new Error('Failed to pin/unpin message: ' + (err.message || err));
      }
      return buildResponse({ success: true, messageId, pin });
    }
  );
}
