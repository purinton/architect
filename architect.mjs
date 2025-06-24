#!/usr/bin/env node
import 'dotenv/config';
import { createDb } from '@purinton/mysql';
import { createOpenAI } from '@purinton/openai';
import { createDiscord } from '@purinton/discord';
import { log, fs, path, registerHandlers, registerSignals } from '@purinton/common';

registerHandlers({ log });
registerSignals({ log });

const packageJson = JSON.parse(fs.readFileSync(path(import.meta, 'package.json')), 'utf8');
const version = packageJson.version;
const presence = { activities: [{ name: `🏗️ AI Admin v v${version}`, type: 4 }], status: 'online' };
const db = await createDb({ log });
registerSignals({ shutdownHook: () => db.end() });

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
