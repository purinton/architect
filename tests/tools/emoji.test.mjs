import { jest } from '@jest/globals';
import emojiTool from '../../tools/emoji.mjs';
describe('emoji tool', () => {
  it('registers tool and handles invalid method', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map([['g', { emojis: { cache: new Map([['e', { id: 'e', name: 'em', url: 'url', roles: { cache: new Map() }, delete: jest.fn() }]]), create: jest.fn(() => ({ id: 'e', name: 'em' })) } }]]) } };
    await emojiTool({ mcpServer, toolName: 'emoji', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({ guildId: 'g', method: 'invalid' }, {});
    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty('text');
    const errorObj = JSON.parse(result.content[0].text);
    expect(errorObj).toMatchObject({ error: 'Invalid method.' });
  });
  it('returns error if guild not found', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map() } };
    await emojiTool({ mcpServer, toolName: 'emoji', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const res = await handler({ guildId: 'x', method: 'create', emojiSettings: { name: 'n', image: 'i' } }, {});
    const obj = JSON.parse(res.content[0].text);
    expect(obj).toMatchObject({ error: 'Guild not found.' });
  });

  it('create errors without name or image', async () => {
    const guild = { emojis: { cache: new Map(), create: jest.fn() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = setup(discord);
    let res = await handler({ guildId: 'g', method: 'create', emojiSettings: {} }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'name and image required for create.' });
  });

  it('create successfully', async () => {
    const newEmoji = { id: 'e', name: 'em' };
    const guild = { emojis: { cache: new Map(), create: jest.fn(async (opts) => newEmoji) } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = setup(discord);
    const res = await handler({ guildId: 'g', method: 'create', emojiSettings: { name: 'em', image: 'u', roles: ['r1'], reason: 'rsn' } }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ created: true, id: 'e', name: 'em' });
    expect(guild.emojis.create).toHaveBeenCalledWith({ name: 'em', image: 'u', roles: ['r1'], reason: 'rsn' });
  });

  it('delete errors without emojiId', async () => {
    const guild = { emojis: { cache: new Map(), create: jest.fn() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = setup(discord);
    const res = await handler({ guildId: 'g', method: 'delete' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'emojiId required for delete.' });
  });

  it('delete errors when emoji not found', async () => {
    const guild = { emojis: { cache: new Map(), create: jest.fn() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = setup(discord);
    const res = await handler({ guildId: 'g', method: 'delete', emojiId: 'x' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'Emoji not found.' });
  });

  it('delete successfully', async () => {
    const del = jest.fn();
    const guild = { emojis: { cache: new Map([['e', { delete: del }]]), create: jest.fn() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = setup(discord);
    const res = await handler({ guildId: 'g', method: 'delete', emojiId: 'e' }, {});
    expect(del).toHaveBeenCalled();
    expect(JSON.parse(res.content[0].text)).toMatchObject({ deleted: true, id: 'e' });
  });

  it('get errors without emojiId', async () => {
    const guild = { emojis: { cache: new Map(), create: jest.fn() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = setup(discord);
    const res = await handler({ guildId: 'g', method: 'get' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'emojiId required for get.' });
  });

  it('get errors when emoji not found', async () => {
    const guild = { emojis: { cache: new Map(), create: jest.fn() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = setup(discord);
    const res = await handler({ guildId: 'g', method: 'get', emojiId: 'x' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'Emoji not found.' });
  });

  it('get successfully returns emoji data', async () => {
    // simulate Discord.js Collection with a map method
    const roles = { cache: { map: (fn) => [{ id: 'r1' }].map(fn) } };
    const emoji = { id: 'e', name: 'em', url: 'u', roles };
    const guild = { emojis: { cache: new Map([['e', emoji]]), create: jest.fn() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = setup(discord);
    const res = await handler({ guildId: 'g', method: 'get', emojiId: 'e' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ id: 'e', name: 'em', url: 'u', roles: ['r1'] });
  });

  // helper to initialize handler
  function setup(discord) {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    emojiTool({ mcpServer, toolName: 'emoji', log, discord });
    return mcpServer.tool.mock.calls[0][3];
  }
// end describe
});
