import { jest } from '@jest/globals';
import channelTool from '../../../tools/channel.mjs';

describe('channel tool - get', () => {
  it('returns channel info', async () => {
    const channelObj = { id: 'c', name: 'chan', type: 2, topic: 't', nsfw: true, bitrate: 64, userLimit: 5, parentId: 'p', position: 1, rateLimitPerUser: 2 };
    const discord = {
      channels: { cache: new Map([['c', channelObj]]) },
      guilds: { cache: new Map() },
    };
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({ method: 'get', channelId: 'c' }, {});
    const res = JSON.parse(result.content[0].text).results;
    expect(res).toEqual([{ id: 'c', name: 'chan', type: 2, topic: 't', nsfw: true, bitrate: 64, userLimit: 5, parent: 'p', position: 1, rateLimitPerUser: 2 }]);
  });
});
