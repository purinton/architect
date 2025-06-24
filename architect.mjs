#!/usr/bin/env node
import 'dotenv/config';
//import { createDb } from '@purinton/mysql';
import { createDiscord } from '@purinton/discord';
import { log, fs, path, registerHandlers, registerSignals } from '@purinton/common';

registerHandlers({ log });
registerSignals({ log });

const packageJson = JSON.parse(fs.readFileSync(path(import.meta, 'package.json')), 'utf8');
const version = packageJson.version;

const presence = { activities: [{ name: `architect v${version}`, type: 4 }], status: 'online' };

//const db = await createDb({ log });
//registerSignals({ shutdownHook: () => db.end() });
const client = await createDiscord({
    log,
    rootDir: path(import.meta),
    context: {
        //db,
        presence,
        version
    },
    intents: {
        Guilds: true,
        GuildMessages: true,
        MessageContent: false,
        GuildMembers: false,
        GuildPresences: false,
        GuildVoiceStates: false,
    }
});
registerSignals({ shutdownHook: () => client.destroy() });
