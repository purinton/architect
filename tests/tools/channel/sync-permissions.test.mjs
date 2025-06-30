import { jest } from '@jest/globals';
import channelTool from '../../../tools/channel.mjs';

describe('channel tool - sync-permissions', () => {
  it('syncs with parent', async () => {
    const lockPermissions = jest.fn();
    const channel = { id: 'c', parent: true, parentId: 'parent1', lockPermissions };
    const discord = {
      channels: { cache: new Map([['c', channel]]) },
      guilds: { cache: new Map() },
    };
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({ method: 'sync-permissions', channelId: 'c' }, {});
    expect(result).toHaveProperty('content');
    const obj = JSON.parse(result.content[0].text);
    expect(obj).toMatchObject({ synced: true, channelId: 'c', parentId: 'parent1' });
    expect(lockPermissions).toHaveBeenCalled();
  });
});
