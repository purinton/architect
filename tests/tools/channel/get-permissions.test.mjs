import { jest } from '@jest/globals';
import channelTool from '../../../tools/channel.mjs';

describe('channel tool - get-permissions', () => {
  it('returns permission overwrites', async () => {
    const permissionOverwrites = {
      cache: [
        { id: 'role1', type: 'role', allow: { toArray: () => ['123'] }, deny: { toArray: () => ['0'] } },
        { id: 'user1', type: 'member', allow: { toArray: () => ['0'] }, deny: { toArray: () => ['456'] } },
      ],
    };
    const discord = {
      channels: { cache: new Map([['c', { id: 'c', permissionOverwrites, guild: { roles: { cache: new Map() }, members: { cache: new Map() } } }]]) },
      guilds: { cache: new Map() },
    };
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({ method: 'get-permissions', channelId: 'c' }, {});
    expect(result).toHaveProperty('content');
    const perms = JSON.parse(result.content[0].text).permissionOverwrites;
    expect(perms).toEqual([
      { id: 'role1', type: 'role', allow: ['123'], deny: ['0'], name: null, inherited: false },
      { id: 'user1', type: 'member', allow: ['0'], deny: ['456'], name: null, inherited: false },
    ]);
  });
});
