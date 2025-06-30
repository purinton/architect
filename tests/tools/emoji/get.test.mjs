import { jest } from '@jest/globals';
import emojiTool from '../../../tools/emoji.mjs';

describe('emoji tool - get', () => {
  it('errors without emojiId', async () => {
    const guild = { emojis: { cache: new Map(), create: jest.fn() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = await setup(discord);
    const res = await handler({ guildId: 'g', method: 'get' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'emojiId required for get.' });
  });
  it('errors when emoji not found', async () => {
    const guild = { emojis: { cache: new Map(), create: jest.fn() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = await setup(discord);
    const res = await handler({ guildId: 'g', method: 'get', emojiId: 'x' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'Emoji not found.' });
  });
  it('successfully returns emoji data', async () => {
    const roles = { cache: { map: (fn) => [{ id: 'r1' }].map(fn) } };
    const emoji = { id: 'e', name: 'em', url: 'u', roles };
    const guild = { emojis: { cache: new Map([['e', emoji]]), create: jest.fn() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = await setup(discord);
    const res = await handler({ guildId: 'g', method: 'get', emojiId: 'e' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ id: 'e', name: 'em', url: 'u', roles: ['r1'] });
  });
  async function setup(discord) {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await emojiTool({ mcpServer, toolName: 'emoji', log, discord });
    return mcpServer.tool.mock.calls[0][3];
  }
});
