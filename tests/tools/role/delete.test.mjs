import { jest } from '@jest/globals';
import del from '../../../tools/role/delete.mjs';
describe('role/delete', () => {
  it('deletes a role', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const deleteFn = jest.fn();
    const role = { id: 'r', delete: deleteFn };
    const discord = { roles: { cache: new Map([['r', role]]) }, guilds: { cache: new Map() } };
    const result = await del({ roleId: 'r', log, discord, buildResponse, toolName: 'role' });
    expect(deleteFn).toHaveBeenCalled();
    expect(result.results[0]).toHaveProperty('deleted', true);
  });
});
