import { jest } from '@jest/globals';
import ban from '../../../tools/moderate/ban.mjs';
describe('moderate/ban', () => {
  it('bans a user', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const banFn = jest.fn();
    const guild = { members: { ban: banFn } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const result = await ban({ guildId: 'g', userId: 'u', moderateSettings: { reason: 'bad' }, log, discord, buildResponse, toolName: 'moderate' });
    expect(banFn).toHaveBeenCalledWith('u', { reason: 'bad' });
    expect(result).toHaveProperty('banned', true);
  });
});
