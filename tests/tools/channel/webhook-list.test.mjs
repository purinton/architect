import { jest } from '@jest/globals';
import channelTool from '../../../tools/channel.mjs';

describe('channel tool - webhook-list', () => {
  it('returns list of webhooks', async () => {
    const fetchWebhooks = jest.fn(async () => [{ id: 'w1', name: 'web1', url: 'u1' }]);
    const channel = { createWebhook: jest.fn(), fetchWebhooks };
    const discord = {
      channels: { cache: new Map([['c', channel]]) },
      fetchWebhook: jest.fn(),
      guilds: { cache: new Map() },
    };
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({ method: 'webhook-list', channelId: 'c' }, {});
    const list = JSON.parse(result.content[0].text).webhooks;
    expect(list).toEqual([{ id: 'w1', name: 'web1', url: 'u1' }]);
  });
});
