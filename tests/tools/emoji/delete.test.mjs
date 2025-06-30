import { jest } from '@jest/globals';
import emojiTool from '../../../tools/emoji.mjs';

describe('emoji tool - delete', () => {
  it('errors without emojiId', async () => {
    const guild = { emojis: { cache: new Map(), create: jest.fn() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = await setup(discord);
    const res = await handler({ guildId: 'g', method: 'delete' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'emojiId required for delete.' });
  });
  it('errors when emoji not found', async () => {
    const guild = { emojis: { cache: new Map(), create: jest.fn() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = await setup(discord);
    const res = await handler({ guildId: 'g', method: 'delete', emojiId: 'x' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'Emoji not found.' });
  });
  it('successfully deletes', async () => {
    const del = jest.fn();
    const guild = { emojis: { cache: new Map([['e', { delete: del }]]), create: jest.fn() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const handler = await setup(discord);
    const res = await handler({ guildId: 'g', method: 'delete', emojiId: 'e' }, {});
    expect(del).toHaveBeenCalled();
    expect(JSON.parse(res.content[0].text)).toMatchObject({ deleted: true, id: 'e' });
  });
  async function setup(discord) {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await emojiTool({ mcpServer, toolName: 'emoji', log, discord });
    return mcpServer.tool.mock.calls[0][3];
  }
});
