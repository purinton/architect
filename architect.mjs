#!/usr/bin/env node
import 'dotenv/config';
import { createDb } from '@purinton/mysql';
import { getReply } from './src/openai.mjs';
import { createOpenAI } from '@purinton/openai';
import { mcpServer } from '@purinton/mcp-server';
import { createDiscord } from '@purinton/discord';
import { log, fs, path, registerHandlers, registerSignals } from '@purinton/common';

registerHandlers({ log });
registerSignals({ log });

const packageJson = JSON.parse(fs.readFileSync(path(import.meta, 'package.json')), 'utf8');
const name = packageJson.name;
const version = packageJson.version;
const presence = { activities: [{ name: `🏗️ AI Admin v v${version}`, type: 4 }], status: 'online' };

const db = await createDb({ log });
registerSignals({ shutdownHook: () => db.end() });

const openai = await createOpenAI();
openai.promptConfig = JSON.parse(fs.readFileSync(path(import.meta, 'openai.json')), 'utf8');
openai.getReply = getReply;

const toolsFile = path(import.meta, 'tools.json');
if (fs.existsSync(toolsFile)) {
    let toolsRaw = fs.readFileSync(toolsFile, 'utf8');
    if (process.env.MCP_TOKEN) {
        toolsRaw = toolsRaw.replace(/\{mcpToken\}/g, process.env.MCP_TOKEN);
    }
    if (process.env.MCP_URL) {
        toolsRaw = toolsRaw.replace(/\{mcpUrl\}/g, process.env.MCP_URL);
    }
    const toolsJson = JSON.parse(toolsRaw);
    if (Array.isArray(toolsJson.tools)) {
        openai.promptConfig.tools = toolsJson.tools;
    }
}

const discord = await createDiscord({
    log,
    rootDir: path(import.meta),
    context: {
        db,
        openai,
        presence,
        version
    },
    intents: {
        GuildMembers: true,
        GuildPresences: true,
        MessageContent: true
    }
});
registerSignals({ shutdownHook: () => discord.destroy() });

const port = parseInt(process.env.MCP_PORT || '1234', 10);
const token = process.env.MCP_TOKEN;
if (!token) {
    log.error('MCP_TOKEN environment variable is required.');
    process.exit(1);
}

const toolsDir = path(import.meta, 'tools');
if (!fs.existsSync(toolsDir)) {
    log.error(`Tools directory not found: ${toolsDir}`);
    process.exit(1);
}

const authCallback = (bearerToken) => {
    return bearerToken === token;
};

try {
    const context = { discord };
    const { httpInstance, transport } = await mcpServer({
        name, version, port, token, toolsDir, log, authCallback, context
    });
    registerSignals({ shutdownHook: () => httpInstance.close() });
    registerSignals({ shutdownHook: () => transport.close() });
    log.info('Ready', { name, version, port });
} catch (err) {
    log.error('Failed to start MCP server', { error: err });
    process.exit(1);
}