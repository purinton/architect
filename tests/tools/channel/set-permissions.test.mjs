import { jest } from '@jest/globals';
import channelTool from '../../../tools/channel.mjs';
import { PermissionsBitField } from 'discord.js';

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
      { id: 'role1', type: 'role', allow: ['ViewChannel'], deny: ['SendMessages'] },
      { id: 'user1', type: 'member', allow: ['SendMessages'], deny: ['ViewChannel'] },
    ];
    const result = await handler({ method: 'set-permissions', channelId: 'c', permissionOverwrites: overwrites }, {});
    expect(result).toHaveProperty('content');
    const obj = JSON.parse(result.content[0].text);
    expect(obj).toMatchObject({ updated: true, count: 2 });
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(
      'role1',
      { allow: PermissionsBitField.Flags.ViewChannel, deny: PermissionsBitField.Flags.SendMessages, type: 'role' }
    );
    expect(edit).toHaveBeenCalledWith(
      'user1',
      { allow: PermissionsBitField.Flags.SendMessages, deny: PermissionsBitField.Flags.ViewChannel, type: 'member' }
    );
  });
});
