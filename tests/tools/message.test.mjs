import { jest } from '@jest/globals';
import messageTool from '../../tools/message.mjs';
describe('message tool', () => {
  it('registers tool and handles invalid method', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { channels: { cache: new Map([['c', { id: 'c', send: jest.fn(), messages: { fetch: jest.fn(() => []), bulkDelete: jest.fn(() => ({ size: 0 })) } }]]) } };
    await messageTool({ mcpServer, toolName: 'message', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    await expect(handler({ channelId: 'c', method: 'invalid' }, {})).rejects.toThrow('Invalid method.');
  });
});
