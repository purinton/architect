import { jest } from '@jest/globals';
import channelTool from '../../../tools/channel.mjs';

describe('channel tool - webhook-delete', () => {
  it('deletes a webhook', async () => {
    const deleteFn = jest.fn();
    const webhook = { delete: deleteFn };
    const fetchWebhook = jest.fn(async (id) => webhook);
    const channel = { createWebhook: jest.fn(), fetchWebhooks: jest.fn() };
    const discord = {
      channels: { cache: new Map([['c', channel]]) },
      fetchWebhook,
      guilds: { cache: new Map() },
    };
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({ method: 'webhook-delete', channelId: 'c', webhookId: 'wid' }, {});
    const obj = JSON.parse(result.content[0].text);
    expect(obj).toMatchObject({ deleted: true, id: 'wid' });
    expect(fetchWebhook).toHaveBeenCalledWith('wid');
    expect(deleteFn).toHaveBeenCalled();
  });
});
