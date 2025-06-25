import { jest } from '@jest/globals';
import emojiTool from '../../tools/emoji.mjs';
describe('emoji tool', () => {
  it('registers tool and handles invalid method', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map([['g', { emojis: { cache: new Map([['e', { id: 'e', name: 'em', url: 'url', roles: { cache: new Map() }, delete: jest.fn() }]]), create: jest.fn(() => ({ id: 'e', name: 'em' })) } }]]) } };
    await emojiTool({ mcpServer, toolName: 'emoji', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    await expect(handler({ guildId: 'g', method: 'invalid' }, {})).rejects.toThrow('Invalid method.');
  });
});
