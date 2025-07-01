import { jest } from '@jest/globals';
import update from '../../../tools/guild/update.mjs';
describe('guild/update', () => {
  it('updates guild info', async () => {
    const buildResponse = jest.fn(x => x);
    const log = { debug: jest.fn(), error: jest.fn() };
    const edit = jest.fn();
    const discord = { guilds: { cache: new Map([['g', { id: 'g', name: 'guild', edit, description: 'desc', iconURL: jest.fn(), bannerURL: jest.fn(), afkChannelId: 'a', afkTimeout: 60, defaultMessageNotifications: 0, explicitContentFilter: 0, mfaLevel: 0, nsfwLevel: 0, preferredLocale: 'en', premiumProgressBarEnabled: false, publicUpdatesChannelId: 'p', rulesChannelId: 'r', safetyAlertsChannelId: 's', splashURL: jest.fn(), systemChannelFlags: { toArray: jest.fn(() => []) }, systemChannelId: 'sys', verificationLevel: 1 }]]) } };
    const result = await update({ guildId: 'g', updateSettings: { name: 'new' }, log, discord, buildResponse, toolName: 'guild' });
    expect(edit).toHaveBeenCalledWith({ name: 'new' });
    expect(result).toHaveProperty('updated', true);
    expect(result.settings).toHaveProperty('id', 'g');
  });
});
