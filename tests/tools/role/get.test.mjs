import { jest } from '@jest/globals';
import get from '../../../tools/role/get.mjs';
describe('role/get', () => {
  it('gets a role', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const role = { id: 'r', name: 'role', permissions: { toArray: jest.fn(() => ['ViewChannel']) }, color: 0, hoist: false, position: 1, mentionable: false };
    const discord = { roles: { cache: new Map([['r', role]]) }, guilds: { cache: new Map() } };
    const result = await get({ roleId: 'r', log, discord, buildResponse, toolName: 'role' });
    expect(result.results[0]).toHaveProperty('id', 'r');
  });
});
