import { jest } from '@jest/globals';
import emojiTool from '../../../tools/emoji.mjs';

describe('emoji tool - unknown method', () => {
  it('registers tool and handles unknown method', async () => {
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
    expect(errorObj).toMatchObject({ error: 'Unknown method: invalid' });
  });
});
