import { jest } from '@jest/globals';
import kick from '../../../tools/moderate/kick.mjs';
describe('moderate/kick', () => {
  it('kicks a user', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const kickFn = jest.fn();
    const guild = { members: { cache: new Map([['u', { kick: kickFn }]]) } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const result = await kick({ guildId: 'g', userId: 'u', moderateSettings: { reason: 'bad' }, log, discord, buildResponse, toolName: 'moderate' });
    expect(kickFn).toHaveBeenCalledWith('bad');
    expect(result).toHaveProperty('kicked', true);
  });
});
