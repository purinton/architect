import { jest } from '@jest/globals';
import channelTool from '../../../tools/channel.mjs';

describe('channel tool - webhook-create', () => {
  it('creates and returns webhook info', async () => {
    const webhook = { id: 'w1', url: 'u1' };
    const createWebhook = jest.fn(async ({ name, avatar, reason }) => webhook);
    const channel = { createWebhook, fetchWebhooks: jest.fn() };
    const discord = {
      channels: { cache: new Map([['c', channel]]) },
      fetchWebhook: jest.fn(),
      guilds: { cache: new Map() },
    };
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const ws = { name: 'n', avatar: 'a', reason: 'r' };
    const result = await handler({ method: 'webhook-create', channelId: 'c', webhookSettings: ws }, {});
    const obj = JSON.parse(result.content[0].text);
    expect(obj).toMatchObject({ created: true, id: 'w1', url: 'u1' });
    expect(createWebhook).toHaveBeenCalledWith({ name: 'n', avatar: 'a', reason: 'r' });
  });
});
