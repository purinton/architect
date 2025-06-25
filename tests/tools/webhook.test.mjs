import { jest } from '@jest/globals';
import webhookTool from '../../tools/webhook.mjs';
describe('webhook tool', () => {
  it('registers tool and handles invalid method', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { channels: { cache: new Map([['c', { id: 'c', createWebhook: jest.fn(), fetchWebhooks: jest.fn(() => []) }]]) }, fetchWebhook: jest.fn(() => ({ delete: jest.fn() })) };
    await webhookTool({ mcpServer, toolName: 'webhook', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    await expect(handler({ channelId: 'c', method: 'invalid' }, {})).rejects.toThrow('Invalid method.');
  });
});
