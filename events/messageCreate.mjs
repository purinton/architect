// events/messageCreate.mjs
import { splitMsg } from '@purinton/discord';

// Per-channel message queue and lock
const channelLocks = new Map();

async function queueMessage(channelId, handler) {
    if (!channelLocks.has(channelId)) {
        channelLocks.set(channelId, []);
    }
    return new Promise((resolve, reject) => {
        channelLocks.get(channelId).push({ handler, resolve, reject });
        if (channelLocks.get(channelId).length === 1) {
            processQueue(channelId);
        }
    });
}

async function processQueue(channelId) {
    const queue = channelLocks.get(channelId);
    if (!queue || queue.length === 0) return;
    const { handler, resolve, reject } = queue[0];
    try {
        const result = await handler();
        resolve(result);
    } catch (err) {
        reject(err);
    } finally {
        queue.shift();
        if (queue.length > 0) {
            processQueue(channelId);
        } else {
            channelLocks.delete(channelId);
        }
    }
}

export default async function ({ client, log, msg, db, openai }, message) {
    log.debug('messageCreate', { id: message.id, JSON.stringify(message) });
    if (message.author.id === message.client.user.id) return;
    if (!message.guild) message.reply('Direct messages are not supported. Please use a channel in a server.');
    const locale = message.guild?.preferredLocale || 'en-US';
    const isMentioned = message.mentions.has(message.client.user);
    const isReplyToBot = message.reference?.message?.author?.id === message.client.user.id;
    const containsHeyArchi = /hey archi/i.test(message.content);
    if (!(isMentioned || isReplyToBot || containsHeyArchi)) return;
    if (!message.member.permissions.has('ADMINISTRATOR')) return;
    await queueMessage(message.channel.id, async () => {
        let typingInterval;
        let typingTimeout;
        try {
            message.channel.sendTyping();
            typingInterval = setInterval(() => {
                message.channel.sendTyping();
            }, 10000);
            typingTimeout = setTimeout(() => {
                if (typingInterval) clearInterval(typingInterval);
                typingInterval = null;
            }, 180000); // 3 minutes
            const messages = await message.channel.messages.fetch({ limit: 100 });
            const replyObj = await openai.getReply(log, db, openai, client.user.id, message.guild, message.channel, messages);
            if (typingInterval) clearInterval(typingInterval);
            if (typingTimeout) clearTimeout(typingTimeout);
            if (!replyObj || !replyObj.text) {
                log.error('Failed to get a reply from OpenAI.');
                return message.reply('An error occurred while processing your request. Please try again later.');
            }
            // Always split text reply
            const splits = splitMsg(replyObj.text, 2000);
            let chunksLeft = splits.length;
            splits.forEach(async (split, idx) => {
                chunksLeft--;
                const options = { content: split };
                if (chunksLeft === 0 && Array.isArray(replyObj.images) && replyObj.images.length > 0) {
                    options.files = replyObj.images.map(img => ({
                        attachment: img.buffer,
                        name: img.filename,
                        description: img.description || undefined
                    }));
                }
                await message.channel.send(options);
            });
        } catch (error) {
            if (typingInterval) clearInterval(typingInterval);
            if (typingTimeout) clearTimeout(typingTimeout);
            log.error('Error in messageCreate event:', error);
            const content = msg(locale, 'error', 'An error occurred while processing your request. Please try again later.', log);
            message.reply({ content });
        }
    });
}