import { jest } from '@jest/globals';
import get from '../../../tools/guild/get.mjs';
describe('guild/get', () => {
  it('returns guild info', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const discord = { guilds: { cache: new Map([['g', { id: 'g', name: 'guild', description: 'desc', iconURL: jest.fn(), bannerURL: jest.fn(), afkChannelId: 'a', afkTimeout: 60, defaultMessageNotifications: 0, explicitContentFilter: 0, mfaLevel: 0, nsfwLevel: 0, preferredLocale: 'en', premiumProgressBarEnabled: false, publicUpdatesChannelId: 'p', rulesChannelId: 'r', safetyAlertsChannelId: 's', splashURL: jest.fn(), systemChannelFlags: { toArray: jest.fn(() => []) }, systemChannelId: 'sys', verificationLevel: 1 }]]) } };
    const result = await get({ guildId: 'g', log, discord, buildResponse, toolName: 'guild' });
    expect(result).toHaveProperty('id', 'g');
    expect(result).toHaveProperty('name', 'guild');
  });
});
