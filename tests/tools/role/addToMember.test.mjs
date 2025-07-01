import { jest } from '@jest/globals';
import addToMember from '../../../tools/role/addToMember.mjs';
describe('role/addToMember', () => {
  it('adds a role to a member', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const add = jest.fn();
    const member = { roles: { add } };
    const guild = { members: { cache: new Map([['m', member]]) } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const result = await addToMember({ guildId: 'g', memberRole: { memberId: 'm', roleId: 'r' }, log, discord, buildResponse, toolName: 'role' });
    expect(add).toHaveBeenCalledWith('r');
    expect(result.results[0]).toHaveProperty('added', true);
  });
});
