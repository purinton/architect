import { jest } from '@jest/globals';
import unban from '../../../tools/moderate/unban.mjs';
describe('moderate/unban', () => {
  it('unbans a user', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const unbanFn = jest.fn();
    const guild = { members: { unban: unbanFn } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const result = await unban({ guildId: 'g', userId: 'u', log, discord, buildResponse, toolName: 'moderate' });
    expect(unbanFn).toHaveBeenCalledWith('u');
    expect(result).toHaveProperty('unbanned', true);
  });
});
