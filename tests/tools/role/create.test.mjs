import { jest } from '@jest/globals';
import create from '../../../tools/role/create.mjs';
describe('role/create', () => {
  it('creates a role', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const createFn = jest.fn(() => ({ id: 'r', name: 'role' }));
    const guild = { roles: { create: createFn, cache: new Map() }, members: { cache: new Map() } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const result = await create({ guildId: 'g', roleSettings: { name: 'role' }, log, discord, buildResponse, toolName: 'role' });
    expect(createFn).toHaveBeenCalledWith({ name: 'role' });
    expect(result.results[0]).toHaveProperty('created', true);
  });
});
