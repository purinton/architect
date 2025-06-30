import { jest } from '@jest/globals';
import roleTool from '../../tools/role.mjs';
describe('role tool', () => {
  it('registers tool and handles invalid method', async () => {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map([['g', { roles: { cache: new Map([['r', { id: 'r', name: 'role', edit: jest.fn(), delete: jest.fn() }]]), create: jest.fn(() => ({ id: 'r', name: 'role' })) }, members: { cache: new Map([['m', { roles: { add: jest.fn(), remove: jest.fn() } }]]) } }]]) }, roles: { cache: new Map([['r', { id: 'r', name: 'role', edit: jest.fn(), delete: jest.fn() }]]) } };
    await roleTool({ mcpServer, toolName: 'role', log, discord });
    const handler = mcpServer.tool.mock.calls[0][3];
    const result = await handler({ guildId: 'g', method: 'invalid' }, {});
    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty('text');
    const errorObj = JSON.parse(result.content[0].text);
    expect(errorObj).toMatchObject({ error: 'Invalid method.' });
  });
  // create method errors without valid settings
  it('create errors without guildId or name', async () => {
    const handler = setup({ guilds: { cache: new Map() }, roles: { cache: new Map() } });
    const res1 = await handler({ method: 'create', roleSettings: {} }, {});
    expect(JSON.parse(res1.content[0].text)).toMatchObject({ error: 'guildId and valid roleSettings (with name) required for create.' });
    const res2 = await handler({ guildId: 'x', method: 'create', roleSettings: { name: '' } }, {});
    expect(JSON.parse(res2.content[0].text)).toMatchObject({ error: 'guildId and valid roleSettings (with name) required for create.' });
  });

  it('create successfully', async () => {
    const created = { id: 'r1', name: 'Role1' };
    const guild = { roles: { cache: new Map(), create: jest.fn(async opts => created) } };
    const handler = setup({ guilds: { cache: new Map([['g', guild]]) }, roles: { cache: new Map() } });
    const res = await handler({ guildId: 'g', method: 'create', roleSettings: { name: 'Role1', color: 123 } }, {});
    expect(guild.roles.create).toHaveBeenCalledWith({ name: 'Role1', color: 123 });
    expect(JSON.parse(res.content[0].text)).toMatchObject({ results: [{ created: true, id: 'r1', name: 'Role1' }] });
  });

  // list method
  it('list errors without guildId', async () => {
    const handler = setup({ guilds: { cache: new Map() }, roles: { cache: new Map() } });
    const res = await handler({ method: 'list' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'guildId required for list.' });
  });

  it('list successfully', async () => {
    const roleObj = { id: 'r1', name: 'Role1', color: 0, position: 1 };
    const guild = { roles: { cache: { map: fn => [roleObj].map(fn) } } };
    const handler = setup({ guilds: { cache: new Map([['g', guild]]) }, roles: { cache: new Map() } });
    const res = await handler({ guildId: 'g', method: 'list' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ roles: [{ id: 'r1', name: 'Role1', color: 0, position: 1 }] });
  });

  // get method
  it('get errors without roleIds', async () => {
    const handler = setup({ guilds: { cache: new Map() }, roles: { cache: new Map() } });
    const res = await handler({ method: 'get' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'roleId(s) required for get.' });
  });

  it('get returns errors for missing roles and success for found', async () => {
    const missing = [{ error: 'Role not found', id: 'x' }];
    const role = { id: 'r1', name: 'Role1', permissions: { bitfield: 8 }, color: 1, hoist: true, position: 2, mentionable: false };
    // Mock roles.cache and guilds.cache.map to control lookup
    const discord = {
      roles: { cache: new Map([['r1', role]]) },
      guilds: { cache: { map: () => [] } }
    };
    const handler = setup(discord);
    const res1 = await handler({ method: 'get', roleId: ['x'] }, {});
    expect(JSON.parse(res1.content[0].text).results).toEqual(missing);
    // For found, override guilds.cache.map to provide a guild with no roles
    discord.guilds.cache.map = () => [{ roles: { cache: new Map([['r1', role]]) } }];
    const res2 = await handler({ method: 'get', roleId: 'r1' }, {});
    expect(JSON.parse(res2.content[0].text).results).toEqual([{ id: 'r1', name: 'Role1', permissions: '8', color: 1, hoist: true, position: 2, mentionable: false }]);
  });

  // update method
  it('update errors without ids or settings', async () => {
    const handler1 = setup({ guilds: { cache: { map: () => [] } }, roles: { cache: new Map() } });
    const res1 = await handler1({ method: 'update' }, {});
    expect(JSON.parse(res1.content[0].text)).toMatchObject({ error: 'roleId(s) and roleSettings required for update.' });
    // For missing role, mock guilds.cache.map and roles.cache without the id
    const handler2 = setup({ guilds: { cache: { map: () => [] } }, roles: { cache: new Map() } });
    const res2 = await handler2({ method: 'update', roleId: 'r1', roleSettings: [{}] }, {});
    expect(JSON.parse(res2.content[0].text)).toMatchObject({ results: [{ error: 'Role not found', id: 'r1' }] });
  });

  it('update successfully', async () => {
    const edit = jest.fn();
    const role = { id: 'r1', edit };
    const discord = { roles: { cache: new Map([['r1', role]]) } };
    const handler = setup({ guilds: { cache: new Map() }, ...discord });
    const res = await handler({ method: 'update', roleId: 'r1', roleSettings: { color: 5, permissions: '16' } }, {});
    expect(edit).toHaveBeenCalledWith({ color: 5, permissions: '16' });
    expect(JSON.parse(res.content[0].text)).toMatchObject({ results: [{ updated: true, id: 'r1' }] });
  });

  // delete method
  it('delete errors without roleIds', async () => {
    const handler = setup({ guilds: { cache: new Map() }, roles: { cache: new Map() } });
    const res = await handler({ method: 'delete' }, {});
    expect(JSON.parse(res.content[0].text)).toMatchObject({ error: 'roleId(s) required for delete.' });
  });

  it('delete successfully', async () => {
    const del = jest.fn();
    const role = { id: 'r1', delete: del };
    const handler = setup({ guilds: { cache: new Map() }, roles: { cache: new Map([['r1', role]]) } });
    const res = await handler({ method: 'delete', roleId: 'r1' }, {});
    expect(del).toHaveBeenCalled();
    expect(JSON.parse(res.content[0].text)).toMatchObject({ results: [{ deleted: true, id: 'r1' }] });
  });

  // addToMember and removeFromMember
  it('addToMember/removeFromMember handles missing params and errors', async () => {
    const handler = setup({ guilds: { cache: new Map() }, roles: { cache: new Map() } });
    const res1 = await handler({ method: 'addToMember' }, {});
    expect(JSON.parse(res1.content[0].text)).toMatchObject({ error: 'guildId and memberRole required.' });
    const res2 = await handler({ method: 'addToMember', guildId: 'x', memberRole: { memberId: 'm', roleId: 'r' } }, {});
    expect(JSON.parse(res2.content[0].text)).toMatchObject({ error: 'Guild not found.' });
  });

  it('addToMember/removeFromMember success and error on members/roles', async () => {
    const add = jest.fn(); const remove = jest.fn();
    const member = { roles: { add, remove } }; const guild = { members: { cache: new Map([['m', member]]) } };
    const handler = setup({ guilds: { cache: new Map([['g', guild]]) }, roles: { cache: new Map() } });
    const resAdd = await handler({ method: 'addToMember', guildId: 'g', memberRole: { memberId: 'm', roleId: 'r1' } }, {});
    expect(add).toHaveBeenCalledWith('r1');
    expect(JSON.parse(resAdd.content[0].text).results).toEqual([{ added: true, memberId: 'm', roleId: 'r1' }]);
    const resRemove = await handler({ method: 'removeFromMember', guildId: 'g', memberRole: { memberId: 'm', roleId: 'r2' } }, {});
    expect(remove).toHaveBeenCalledWith('r2');
    expect(JSON.parse(resRemove.content[0].text).results).toEqual([{ removed: true, memberId: 'm', roleId: 'r2' }]);
  });

  // helper to initialize handler
  function setup(discord) {
    const mcpServer = { tool: jest.fn((name, desc, schema, handler) => handler) };
    const log = { debug: jest.fn(), error: jest.fn() };
    roleTool({ mcpServer, toolName: 'role', log, discord });
    return mcpServer.tool.mock.calls[0][3];
  }
// end describe
});
