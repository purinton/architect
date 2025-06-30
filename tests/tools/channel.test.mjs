import { jest } from '@jest/globals';
import channelTool from '../../tools/channel.mjs';
describe('channel tool', () => {
  it('registers tool and handles invalid method', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map([['g', { channels: { cache: new Map([['c', { id: 'c', name: 'chan', type: 0, edit: jest.fn(), delete: jest.fn() }]]) } }]]) } };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({ method: 'invalid' }, {});
    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty('text');
    const errorObj = JSON.parse(result.content[0].text);
    expect(errorObj).toMatchObject({ error: 'Invalid method.' });
  });

  it('get-permissions returns permission overwrites', async () => {
    const permissionOverwrites = {
      cache: [
        { id: 'role1', type: 'role', allow: { bitfield: '123' }, deny: { bitfield: '0' } },
        { id: 'user1', type: 'member', allow: { bitfield: '0' }, deny: { bitfield: '456' } },
      ],
    };
    const discord = {
      channels: { cache: new Map([['c', { id: 'c', permissionOverwrites }]]) },
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
      { id: 'role1', type: 'role', allow: '123', deny: '0' },
      { id: 'user1', type: 'member', allow: '0', deny: '456' },
    ]);
  });

  it('set-permissions sets permission overwrites', async () => {
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
      { id: 'role1', type: 'role', allow: '123', deny: '0' },
      { id: 'user1', type: 'member', allow: '0', deny: '456' },
    ];
    const result = await handler({ method: 'set-permissions', channelId: 'c', permissionOverwrites: overwrites }, {});
    expect(result).toHaveProperty('content');
    const obj = JSON.parse(result.content[0].text);
    expect(obj).toMatchObject({ updated: true, count: 2 });
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith('role1', { allow: '123', deny: '0', type: 'role' });
    expect(edit).toHaveBeenCalledWith('user1', { allow: '0', deny: '456', type: 'member' });
  });

  it('sync-permissions syncs with parent', async () => {
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

  // create method
  it('create method creates channels', async () => {
    const create = jest.fn(async (opts) => ({ id: 'new', name: opts.name }));
    const guild = { channels: { create } };
    const discord = {
      guilds: { cache: new Map([['g', guild]]) },
      channels: { cache: new Map() },
    };
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const settings = { name: 'test', type: 0 };
    const result = await handler({ method: 'create', guildId: 'g', channelSettings: settings }, {});
    const res = JSON.parse(result.content[0].text).results;
    expect(create).toHaveBeenCalledWith(settings);
    expect(res).toEqual([{ created: true, id: 'new', name: 'test' }]);
  });

  // list method
  it('list method returns channels', async () => {
    const chanObj = { id: 'c1', name: 'one', type: 1 };
    const guild = { channels: { cache: { map: (fn) => [chanObj] } } };
    const discord = {
      guilds: { cache: new Map([['g', guild]]) },
      channels: { cache: new Map() },
    };
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({ method: 'list', guildId: 'g' }, {});
    const chans = JSON.parse(result.content[0].text).channels;
    expect(chans).toEqual([{ id: 'c1', name: 'one', type: 1 }]);
  });

  // get method
  it('get method returns channel info', async () => {
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

  // update method
  it('update method edits channel settings', async () => {
    const edit = jest.fn();
    const channelObj = { id: 'c', type: 0, edit };
    const discord = {
      channels: { cache: new Map([['c', channelObj]]) },
      guilds: { cache: new Map() },
    };
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    await channelTool({ mcpServer, toolName: 'channel', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const settings = { nsfw: true };
    const result = await handler({ method: 'update', channelId: 'c', channelSettings: settings }, {});
    const res = JSON.parse(result.content[0].text).results;
    expect(edit).toHaveBeenCalledWith(settings);
    expect(res).toEqual([{ updated: true, id: 'c' }]);
  });

  // delete method
  it('delete method removes channel', async () => {
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

  // webhook-list method
  it('webhook-list returns list of webhooks', async () => {
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

  // webhook-create method
  it('webhook-create creates and returns webhook info', async () => {
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

  // webhook-delete method
  it('webhook-delete deletes a webhook', async () => {
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
// end describe
});
