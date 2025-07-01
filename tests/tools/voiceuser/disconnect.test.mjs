
import { jest } from '@jest/globals';
import disconnect from '../../../tools/voiceuser/disconnect.mjs';

describe('voiceuser/disconnect', () => {
  it('disconnects a user from voice', async () => {
    const disconnectFn = jest.fn();
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map([
      ['g', { members: { cache: new Map([
        ['u', { voice: { disconnect: disconnectFn } }]
      ]) } }]
    ]) } };
    const params = { guildId: 'g', userId: 'u' };
    const result = await disconnect({ ...params, log, discord, buildResponse, toolName: 'voiceuser' });
    expect(disconnectFn).toHaveBeenCalled();
    expect(result).toHaveProperty('disconnected', true);
  });
});
