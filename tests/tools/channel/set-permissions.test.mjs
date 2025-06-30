import { jest } from '@jest/globals';
import channelTool from '../../../tools/channel.mjs';

describe('channel tool - set-permissions', () => {
  it('sets permission overwrites', async () => {
    const edit = jest.fn();
    const permissionOverwrites = { edit };
    const discord = {
      channels: { cache: new Map([['c', { id: 'c', permissionOverwrites }]]) },
      guilds: { cache: new Map() },
    };
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const overwrites = [
      { id: 'role1', type: 'role', allow: ['123'], deny: ['0'] },
      { id: 'user1', type: 'member', allow: ['0'], deny: ['456'] },
    ];
    const result = await handler({ method: 'set-permissions', channelId: 'c', permissionOverwrites: overwrites }, {});
    expect(result).toHaveProperty('content');
    const obj = JSON.parse(result.content[0].text);
    expect(obj).toMatchObject({ updated: true, count: 2 });
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith('role1', { allow: 123n, deny: 0n, type: 'role' });
    expect(edit).toHaveBeenCalledWith('user1', { allow: 0n, deny: 456n, type: 'member' });
  });
});
