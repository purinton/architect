
import { jest } from '@jest/globals';
import serverDeafen from '../../../tools/voiceuser/serverDeafen.mjs';

describe('voiceuser/serverDeafen', () => {
  it('deafens a user in voice', async () => {
    const setDeaf = jest.fn();
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map([
      ['g', { members: { cache: new Map([
        ['u', { voice: { setDeaf } }]
      ]) } }]
    ]) } };
    const params = { guildId: 'g', userId: 'u', voiceUserSettings: { deafen: true } };
    const result = await serverDeafen({ ...params, log, discord, buildResponse, toolName: 'voiceuser' });
    expect(setDeaf).toHaveBeenCalledWith(true);
    expect(result).toHaveProperty('serverDeafen', true);
    expect(result).toHaveProperty('deafen', true);
  });
});
