import { jest } from '@jest/globals';
import update from '../../../tools/role/update.mjs';
describe('role/update', () => {
  it('updates a role', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const editFn = jest.fn();
    const role = { id: 'r', edit: editFn };
    const discord = { roles: { cache: new Map([['r', role]]) }, guilds: { cache: new Map() } };
    const result = await update({ roleId: 'r', roleSettings: { name: 'new' }, log, discord, buildResponse, toolName: 'role' });
    expect(editFn).toHaveBeenCalledWith({ name: 'new' });
    expect(result.results[0]).toHaveProperty('updated', true);
  });
});
