#!/usr/bin/env node
import 'dotenv/config';
import { createDb } from '@purinton/mysql';
import { createOpenAI } from '@purinton/openai';
import { mcpServer } from '@purinton/mcp-server';
import { createDiscord } from '@purinton/discord';
import { log, fs, path, registerHandlers, registerSignals } from '@purinton/common';

registerHandlers({ log });
registerSignals({ log });

const packageJson = JSON.parse(fs.readFileSync(path(import.meta, 'package.json')), 'utf8');
const version = packageJson.version;
const presence = { activities: [{ name: `🏗️ AI Admin v v${version}`, type: 4 }], status: 'online' };
const db = await createDb({ log });
registerSignals({ shutdownHook: () => db.end() });

const openai = await createOpenAI();

const discord = await createDiscord({
    log,
    rootDir: path(import.meta),
    context: {
        db,
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
    const context = { db, discord, openai };
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