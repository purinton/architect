import { jest } from '@jest/globals';
import channelTool from '../../../tools/channel.mjs';

describe('channel tool - delete', () => {
  it('removes channel', async () => {
    const del = jest.fn();
    const channelObj = { id: 'c', delete: del };
    const discord = {
      channels: { cache: new Map([['c', channelObj]]) },
      guilds: { cache: new Map() },
    };
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({ method: 'delete', channelId: 'c' }, {});
    const res = JSON.parse(result.content[0].text).results;
    expect(del).toHaveBeenCalled();
    expect(res).toEqual([{ deleted: true, id: 'c' }]);
  });
});
