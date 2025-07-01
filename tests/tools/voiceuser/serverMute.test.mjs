import { jest } from '@jest/globals';
import serverMute from '../../../tools/voiceuser/serverMute.mjs';
describe('voiceuser/serverMute', () => {
  it('mutes a user in voice', async () => {
    const setMute = jest.fn();
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = {
      guilds: {
        cache: new Map([
          ['g', {
            members: {
              cache: new Map([
                ['u', { voice: { setMute } }]
              ])
            }
          }]
        ])
      }
    };
    const params = { guildId: 'g', userId: 'u', voiceUserSettings: { mute: true } };
    const result = await serverMute({ ...params, log, discord, buildResponse, toolName: 'voiceuser' });
    expect(setMute).toHaveBeenCalledWith(true);
    expect(result).toHaveProperty('serverMute', true);
    expect(result).toHaveProperty('mute', true);
  });
});
