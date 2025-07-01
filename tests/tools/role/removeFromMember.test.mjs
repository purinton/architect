import { jest } from '@jest/globals';
import removeFromMember from '../../../tools/role/removeFromMember.mjs';
describe('role/removeFromMember', () => {
  it('removes a role from a member', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const remove = jest.fn();
    const member = { roles: { remove } };
    const guild = { members: { cache: new Map([['m', member]]) } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const result = await removeFromMember({ guildId: 'g', memberRole: { memberId: 'm', roleId: 'r' }, log, discord, buildResponse, toolName: 'role' });
    expect(remove).toHaveBeenCalledWith('r');
    expect(result.results[0]).toHaveProperty('removed', true);
  });
});
