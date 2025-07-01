import { jest } from '@jest/globals';
import timeout from '../../../tools/moderate/timeout.mjs';
describe('moderate/timeout', () => {
  it('times out a user', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const timeoutFn = jest.fn();
    const guild = { members: { cache: new Map([['u', { timeout: timeoutFn }]]) } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const result = await timeout({ guildId: 'g', userId: 'u', moderateSettings: { duration: 1000, reason: 'bad' }, log, discord, buildResponse, toolName: 'moderate' });
    expect(timeoutFn).toHaveBeenCalledWith(1000, 'bad');
    expect(result).toHaveProperty('timedOut', true);
  });
});
