import { jest } from '@jest/globals';
import threadTool from '../../tools/thread.mjs';
describe('thread tool', () => {
  it('registers tool and handles invalid method', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { channels: { cache: new Map([['c', { id: 'c', threads: { create: jest.fn(() => ({ id: 't', name: 'th' })), fetch: jest.fn(() => ({ threads: [] })) } }]]) } };
    await threadTool({ mcpServer, toolName: 'thread', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    await expect(handler({ channelId: 'c', method: 'invalid' }, {})).rejects.toThrow('Invalid method.');
  });
});
