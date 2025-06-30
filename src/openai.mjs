import https from 'https';
import path from 'path';
import fs from 'fs';

// Helper to recursively strip null, undefined, false, empty array/object, and avoid circular references
function stripFalsy(obj, seen = new WeakSet(), depth = 0) {
    if (depth > 20) return undefined; // Prevent excessive depth
    if (obj && typeof obj === 'object') {
        if (seen.has(obj)) return undefined; // Prevent circular refs
        seen.add(obj);
    }
    if (Array.isArray(obj)) {
        const arr = obj
            .map(item => stripFalsy(item, seen, depth + 1))
            .filter(
                v =>
                    v !== null &&
                    v !== undefined &&
                    v !== false &&
                    !(Array.isArray(v) && v.length === 0) &&
                    !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
            );
        return arr.length > 0 ? arr : undefined;
    } else if (typeof obj === 'object' && obj !== null) {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            const v = stripFalsy(value, seen, depth + 1);
            if (
                v !== null &&
                v !== undefined &&
                v !== false &&
                !(Array.isArray(v) && v.length === 0) &&
                !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
            ) {
                cleaned[key] = v;
            }
        }
        return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    }
    return obj;
}

async function getKey(db, appId, guildId, channelId) {
    const [rows] = await db.execute(
        'SELECT response_id FROM channels WHERE app_id = ? AND guild_id = ? AND channel_id = ? LIMIT 1',
        [appId, guildId, channelId]
    );
    if (rows && rows.length > 0) {
        return rows[0].response_id;
    }
    return null;
}

async function setKey(db, appId, guildId, channelId, responseId) {
    await db.execute(
        `REPLACE INTO channels (app_id, guild_id, channel_id, response_id) VALUES (?, ?, ?, ?)`,
        [appId, guildId, channelId, responseId]
    );
}

async function downloadImageToTmp(url, filename) {
    const cacheDir = path.join('/tmp', 'architect.cache');
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }
    const tmpPath = path.join(cacheDir, filename);
    if (fs.existsSync(tmpPath)) {
        return tmpPath;
    }
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(tmpPath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                fs.unlinkSync(tmpPath);
                return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(tmpPath));
            });
        }).on('error', (err) => {
            fs.unlinkSync(tmpPath);
            reject(err);
        });
    });
}

export async function getReply(log, db, openai, appId, guild, channel, messages) {
    log.debug('getReply called with:', { appId, guild_id: guild.id, channel_id: channel.id, messages_count: messages.size });
    const config = JSON.parse(JSON.stringify(openai.promptConfig));
    if (!config.input || !config.input.length) {
        log.error('OpenAI configuration does not contain any messages.');
        return { text: "An error occurred while processing your request. Please try again later.", images: [] };
    }

    const previousResponseId = await getKey(db, appId, guild.id, channel.id);
    let newConversation = false;
    if (previousResponseId) {
        config.input = [];
        config.previous_response_id = previousResponseId;
    } else {
        newConversation = true;
        if (Array.isArray(config.input[0].content) && config.input[0].content.length > 0) {
            config.input[0].content[0].text = config.input[0].content[0].text
                .replace('{appId}', appId)
                .replace('{guildId}', guild.id)
                .replace('{guildName}', guild.name)
                .replace('{preferredLocale}', guild.preferredLocale || 'en-US')
                .replace('{channelId}', channel.id)
                .replace('{channelName}', channel.name)
                .replace('{channelTopic}', channel.topic || 'No topic set');
        }
    }

    const historyMessages = [];
    for (const message of messages.values()) {
        if (!newConversation && message.author.id === appId) break;
        if (newConversation && message.author.id === appId) {
            historyMessages.push({
                role: 'assistant',
                content: [{ type: 'output_text', text: message.content }]
            });
            continue;
        }
        // Strip falsy values before stringifying
        const cleanedMessage = stripFalsy(message);
        let text = JSON.stringify(cleanedMessage);
        const contentArr = [{ type: 'input_text', text }];

        let attachmentsIterable = [];
        if (message.attachments) {
            if (typeof message.attachments.values === 'function' && typeof message.attachments.toJSON === 'function') {
                attachmentsIterable = message.attachments.toJSON();
            } else if (Array.isArray(message.attachments)) {
                attachmentsIterable = message.attachments;
            } else if (typeof message.attachments === 'object' && message.attachments !== null) {
                attachmentsIterable = Object.values(message.attachments);
            }
        }
        let foundImage = false;
        for (const att of attachmentsIterable) {
            let url = undefined;
            if (typeof att.url === 'string' && att.url.length > 0) {
                url = att.url;
            } else if (typeof att.attachment === 'string' && att.attachment.length > 0) {
                url = att.attachment;
            } else if (typeof att.proxyURL === 'string' && att.proxyURL.length > 0) {
                url = att.proxyURL;
            }
            if (typeof url === 'string' && url.match(/\.(png|jpe?g|webp|gif)(?:\?.*)?$/i)) {
                try {
                    const urlObj = new URL(url);
                    const pathParts = urlObj.pathname.split('/');
                    let attachmentId = att.id;
                    let ext = path.extname(pathParts[pathParts.length - 1]).split('?')[0] || '.png';
                    const baseName = `${attachmentId}${ext}`;
                    const tmpPath = await downloadImageToTmp(url, baseName);
                    const base64Image = fs.readFileSync(tmpPath, 'base64');
                    let mime = 'image/png';
                    if (ext.match(/jpe?g/i)) mime = 'image/jpeg';
                    else if (ext.match(/webp/i)) mime = 'image/webp';
                    else if (ext.match(/gif/i)) mime = 'image/gif';
                    contentArr.push({
                        type: 'input_image',
                        image_url: `data:${mime};base64,${base64Image}`
                    });
                    foundImage = true;
                } catch (err) {
                    log.error('Failed to download or encode image', err);
                }
            }
        }
        if (!foundImage && attachmentsIterable && Array.from(attachmentsIterable).length > 0) {
            log.warn('No valid image attachments found in attachmentsIterable.');
        }
        historyMessages.push({
            role: 'user',
            content: contentArr
        });
    }

    historyMessages.reverse();
    for (const msg of historyMessages) {
        config.input.push(msg);
    }

    let response;
    try {
        //log.debug('OpenAI API Call', config);
        response = await openai.responses.create(config);
        log.debug('OpenAI API Response', response);
    } catch (error) {
        log.error('Error calling OpenAI API:', error);
        return { text: "An error occurred while processing your request. Please try again later.", images: [] };
    }

    const responseId = response?.id;
    let reply = null;
    let images = [];
    if (Array.isArray(response?.output) && response.output.length > 0) {
        // Collect images from image_generation_call
        for (const item of response.output) {
            if (item.type === 'image_generation_call' && item.result && typeof item.result === 'string') {
                try {
                    const buffer = Buffer.from(item.result, 'base64');
                    const filename = `openai_image_${item.id || Date.now()}.png`;
                    images.push({
                        buffer,
                        filename,
                        description: item.revised_prompt || 'Generated image',
                        size: item.size || undefined
                    });
                } catch (e) {
                    log.error('Failed to decode OpenAI image result', e);
                }
            }
        }
        const assistantMsg = response.output.find(msg => msg.role === 'assistant');
        if (assistantMsg && Array.isArray(assistantMsg.content) && assistantMsg.content.length > 0) {
            const outputText = assistantMsg.content.find(c => c.type === 'output_text');
            if (outputText && typeof outputText.text === 'string') {
                reply = outputText.text.trim();
            }
        }
    }
    if (!reply) {
        if (typeof response.output_text === 'string' && response.output_text.trim() !== '') {
            reply = response.output_text.trim();
        }
    }
    if (!reply) {
        log.error('Malformed or empty response from OpenAI API.', { response });
        reply = "An error occurred while processing your request. Please try again later.";
    }

    if (responseId) {
        await setKey(db, appId, guild.id, channel.id, responseId);
    }
    return { text: reply, images };
}
