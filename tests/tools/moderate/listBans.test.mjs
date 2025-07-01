import { jest } from '@jest/globals';
import listBans from '../../../tools/moderate/listBans.mjs';
describe('moderate/listBans', () => {
  it('lists bans', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const fetch = jest.fn(() => [{ user: { id: 'u', tag: 'tag' }, reason: 'bad' }]);
    const guild = { bans: { fetch } };
    const discord = { guilds: { cache: new Map([['g', guild]]) } };
    const result = await listBans({ guildId: 'g', log, discord, buildResponse, toolName: 'moderate' });
    expect(fetch).toHaveBeenCalled();
    expect(result).toHaveProperty('bans');
    expect(result.bans[0]).toHaveProperty('userId', 'u');
  });
});
