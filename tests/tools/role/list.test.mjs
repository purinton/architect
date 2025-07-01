import { jest } from '@jest/globals';
import list from '../../../tools/role/list.mjs';
describe('role/list', () => {
  it('lists roles', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const roles = [{ id: 'r', name: 'role', color: 0, position: 1 }];
    const guild = { roles: { cache: roles } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const result = await list({ guildId: 'g', log, discord, buildResponse, toolName: 'role' });
    expect(result.roles[0]).toHaveProperty('id', 'r');
  });
});
