
import { jest } from '@jest/globals';
import move from '../../../tools/voiceuser/move.mjs';

describe('voiceuser/move', () => {
  it('moves a user to a new channel', async () => {
    const setChannel = jest.fn();
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map([
      ['g', { members: { cache: new Map([
        ['u', { voice: { setChannel } }]
      ]) } }]
    ]) } };
    const params = { guildId: 'g', userId: 'u', voiceUserSettings: { channelId: 'c' } };
    const result = await move({ ...params, log, discord, buildResponse, toolName: 'voiceuser' });
    expect(setChannel).toHaveBeenCalledWith('c');
    expect(result).toHaveProperty('moved', true);
    expect(result).toHaveProperty('channelId', 'c');
  });
});
