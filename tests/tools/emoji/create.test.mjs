import { jest } from '@jest/globals';
import emojiTool from '../../../tools/emoji.mjs';

describe('emoji tool - create', () => {
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
  it('errors without name or image', async () => {
    const guild = { emojis: { cache: new Map(), create: jest.fn() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = await setup(discord);
    let res = await handler({ guildId: 'g', method: 'create', emojiSettings: {} }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'name and image required for create.' });
  });
  it('successfully creates', async () => {
    const newEmoji = { id: 'e', name: 'em' };
    const guild = { emojis: { cache: new Map(), create: jest.fn(async (opts) => newEmoji) } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = await setup(discord);
    const res = await handler({ guildId: 'g', method: 'create', emojiSettings: { name: 'em', image: 'u', roles: ['r1'], reason: 'rsn' } }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ created: true, id: 'e', name: 'em' });
    expect(guild.emojis.create).toHaveBeenCalledWith({ name: 'em', image: 'u', roles: ['r1'], reason: 'rsn' });
  });
  async function setup(discord) {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await emojiTool({ mcpServer, toolName: 'emoji', log, discord });
    return mcpServer.tool.mock.calls[0][3];
  }
});
