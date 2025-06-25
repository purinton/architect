import { z, buildResponse } from '@purinton/mcp-server';

// Tool: send-message
// Sends a message to a specified channel in a guild.
export default async function ({ mcpServer, toolName, log, discord }) {
    mcpServer.tool(
        toolName,
        'Send a message to a channel.',
        {
            guildId: z.string(),
            channelId: z.string(),
            content: z.string().min(0).max(2000).optional(),
            embed: z.preprocess(
                (v) => v === null ? undefined : v,
                z.object({
                    title: z.string().optional(),
                    description: z.string().optional(),
                    url: z.string().optional(),
                    color: z.number().optional(),
                    fields: z.array(z.object({
                        name: z.string(),
                        value: z.string(),
                        inline: z.boolean().optional(),
                    })).optional(),
                    footer: z.object({ text: z.string(), icon_url: z.string().optional() }).optional(),
                    image: z.object({ url: z.string() }).optional(),
                    thumbnail: z.object({ url: z.string() }).optional(),
                    author: z.object({ name: z.string(), icon_url: z.string().optional(), url: z.string().optional() }).optional(),
                    timestamp: z.string().optional(),
                }).optional()
            ),
        },
        async (_args, _extra) => {
            log.debug(`${toolName} Request`, { _args });
            const { guildId, channelId, content, embed } = _args;
            const guild = await discord.helpers.getGuild(guildId);
            const channel = await discord.helpers.getChannel(guild, channelId);
            if (!content && !embed) throw new Error('Either content or embed must be provided.');

            let messagePayload = {};
            if (content) messagePayload.content = content;
            if (embed) messagePayload.embeds = [embed];

            let sentMessage;
            try {
                sentMessage = await channel.send(messagePayload);
            } catch (err) {
                throw new Error('Failed to send message: ' + (err.message || err));
            }
            const response = { success: true, messageId: sentMessage.id };
            log.debug(`${toolName} Response`, { response });
            return buildResponse(response);
        }
    );
}
