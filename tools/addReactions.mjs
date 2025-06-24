import { z } from 'zod';
import { getGuild, getChannel, getMessage, buildResponse } from '../toolHelpers.mjs';

// Tool: add-reactions
// Adds multiple reactions (emojis) to multiple specified messages in a channel.
export default async function (server, toolName = 'discord-add-reactions') {
    server.tool(
        toolName,
        'Add multiple reactions (emojis) to multiple messages in a channel.',
        {
            guildId: z.string(),
            channelId: z.string(),
            messageIds: z.array(z.string()),
            emojis: z.array(z.string()), // Unicode emoji or custom emoji string
        },
        async (args, extra) => {
            const { guildId, channelId, messageIds, emojis } = args;
            const guild = getGuild(guildId);
            const channel = await getChannel(guild, channelId);
            const results = [];
            for (const messageId of messageIds) {
                let message;
                try {
                    message = await getMessage(channel, messageId);
                } catch (err) {
                    results.push({ messageId, success: false, error: 'Failed to fetch message: ' + (err.message || err) });
                    continue;
                }
                for (const emoji of emojis) {
                    try {
                        await message.react(emoji);
                        results.push({ messageId, emoji, success: true });
                    } catch (err) {
                        results.push({ messageId, emoji, success: false, error: 'Failed to add reaction: ' + (err.message || err) });
                    }
                }
            }
            return buildResponse({ results });
        }
    );
}
